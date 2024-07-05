const fetchUtils = require("./FetchResultsUtils");
const recommendUtils = require("./RecommendUtils");
const {
  NUM_RECOMMENDATIONS,
  INTEREST_SCORE_WEIGHT,
  PREFERENCE_SCORE_WEIGHT,
  TRANSIT_SCORE_WEIGHT,
} = process.env;

async function calculateInterestScores(query, interests, options) {
  const transformer = await recommendUtils.getTransformer();
  const getEmbedding = recommendUtils.getEmbedder(transformer);

  const queryEmbedding = await getEmbedding(query);
  const alignedInterests = await recommendUtils.getAlignedInterests(
    queryEmbedding,
    interests,
    getEmbedding
  );

  const adjustedQueryEmbedding = await getEmbedding(
    [query, ...alignedInterests].join()
  );

  const interestScores = new Map();
  for (const option of options) {
    const { id, displayName, editorialSummary, types } = option.place;
    const descriptionEmbedding = await getEmbedding(
      [displayName.text, editorialSummary?.text, ...types].join(", ")
    );
    interestScores.set(
      id,
      recommendUtils.cosineSimilarity(
        adjustedQueryEmbedding,
        descriptionEmbedding
      )
    );
  }
  return recommendUtils.normalizeScores(interestScores);
}

function calculatePreferenceScores(settings, options) {
  const { budget, minRating, goodForChildren, goodForGroups, isAccessible } =
    settings;
  const userVector = [
    biasPreference(budget, true),
    biasPreference(minRating, false),
    +goodForChildren,
    +goodForGroups,
    +isAccessible,
  ];

  const preferenceScores = new Map();
  for (const option of options) {
    const { rating, goodForChildren, goodForGroups } = option.place;
    const { priceLevel, accessibilityScore } = option.extracted;
    const optionVector = [
      priceLevel,
      rating,
      goodForChildren ? 1 : 0,
      goodForGroups ? 1 : 0,
      accessibilityScore,
    ];
    preferenceScores.set(
      option.place.id,
      recommendUtils.cosineSimilarity(userVector, optionVector)
    );
  }
  return recommendUtils.normalizeScores(preferenceScores);
}

function calculateTransitScores(options) {
  const VALUE_OF_SECOND = 28 / (60 * 60); // $28 per hour

  const transitScores = new Map();
  for (const option of options) {
    transitScores.set(
      option.place.id,
      1 / (option.extracted.fare + option.extracted.duration * VALUE_OF_SECOND)
    );
  }
  return recommendUtils.normalizeScores(transitScores);
}

function biasPreference(value, isDownward) {
  const BIAS = 0.9;
  return isDownward ? value ** BIAS : value ** (1 / BIAS);
}

async function recommend(query, interests, settings) {
  let { options, nextPageToken: initialNextPageToken } =
    await fetchUtils.getOptions(
      query,
      settings.originAddress,
      settings.center.latitude,
      settings.center.longitude,
      NUM_RECOMMENDATIONS,
      true
    );
  options = options.filter((option) =>
    recommendUtils.feasibilityFilter(option, settings)
  );

  await recommendUtils.refetch(
    options,
    initialNextPageToken,
    NUM_RECOMMENDATIONS,
    settings,
    query
  );

  // TODO generate interest, preference, and transit vector for each option in one iteration
  const interestScores = await calculateInterestScores(
    query,
    interests,
    options
  );
  const preferenceScores = calculatePreferenceScores(settings, options);
  const transitScores = calculateTransitScores(options);

  const combinedScoresComparator = (a, b) => {
    const aId = a.place.id;
    const bId = b.place.id;
    return (
      INTEREST_SCORE_WEIGHT *
        (interestScores.get(aId) - interestScores.get(bId)) +
      PREFERENCE_SCORE_WEIGHT *
        (preferenceScores.get(aId) - preferenceScores.get(bId)) +
      TRANSIT_SCORE_WEIGHT * (transitScores.get(aId) - transitScores.get(bId))
    );
  };

  return options.sort(combinedScoresComparator);
}

module.exports = { recommend };
