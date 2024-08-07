const recommendUtils = require("./RecommendUtils");
const recommendCommunity = require("./RecommendCommunity");
const { NUM_RECOMMENDATIONS, MAX_POSSIBLE_PRICE_LEVEL, MAX_POSSIBLE_RATING } =
  process.env;

// Use user interest, preference, and quality of transit to recommend places of interest
async function recommend(query, profile, settings) {
  const { interests, weightInterest, weightPreference, weightTransit } =
    profile;
  const weights = {
    interest: weightInterest,
    preference: weightPreference,
    transit: weightTransit,
  };

  const options = await recommendUtils.fetchRecommendations(
    NUM_RECOMMENDATIONS,
    settings,
    query
  );

  const interestScores = await calculateInterestScores(
    query,
    interests,
    options
  );
  const preferenceScores = calculatePreferenceScores(settings, options);
  const transitScores = calculateTransitScores(options);
  const communityBoosts = await calculateCommunityBoosts(profile, options);

  options.forEach((option) => {
    const id = option.place.id;
    option.scores = {
      interest: interestScores.get(id),
      preference: preferenceScores.get(id),
      transit: transitScores.get(id),
    };
  });

  return options.sort(
    (a, b) =>
      calculateWeightedScore(b, communityBoosts, weights) -
      calculateWeightedScore(a, communityBoosts, weights)
  );
}

async function calculateInterestScores(query, interests, options) {
  const transformer = await recommendUtils.getTransformer();
  const getEmbedding = recommendUtils.getEmbedder(transformer);

  const queryEmbedding = await getEmbedding(query);
  const alignedInterests = await recommendUtils.getAlignedInterests(
    queryEmbedding,
    interests,
    getEmbedding
  );

  // enhance the query using similar interests from the user profile
  const adjustedQueryEmbedding = await getEmbedding(
    [query, ...alignedInterests].join()
  );

  const descriptionEmbeddingPromises = options.map((option) => {
    const { displayName, editorialSummary, types } = option.place;
    return getEmbedding(
      [displayName.text, editorialSummary?.text, ...types].join(", ")
    );
  });
  const descriptionEmbeddings = await Promise.all(descriptionEmbeddingPromises);

  const interestScores = new Map(
    options.map((option, i) => [
      option.place.id,
      recommendUtils.cosineSimilarity(
        adjustedQueryEmbedding,
        descriptionEmbeddings[i]
      ),
    ])
  );

  return recommendUtils.normalizeScores(interestScores);
}

// Compare user preferences with the attributes of a location using cosine similarity
function calculatePreferenceScores(settings, options) {
  const {
    budget,
    minRating,
    goodForChildren,
    goodForGroups,
    isAccessible: preferAccessible,
  } = settings;
  const userVector = [
    recommendUtils.biasPreference(budget / MAX_POSSIBLE_PRICE_LEVEL, true),
    recommendUtils.biasPreference(minRating / MAX_POSSIBLE_RATING, false),
    goodForChildren ? 1 : 0,
    goodForGroups ? 1 : 0,
    preferAccessible ? 1 : 0,
  ];

  const preferenceScores = new Map();
  for (const option of options) {
    const { rating, goodForChildren, goodForGroups } = option.place;
    const { priceLevel, accessibilityScore } = option.extracted;
    const optionVector = [
      priceLevel / MAX_POSSIBLE_PRICE_LEVEL,
      rating / MAX_POSSIBLE_RATING,
      goodForChildren ? 1 : 0,
      goodForGroups ? 1 : 0,
      preferAccessible ? accessibilityScore : 0, // disregards accessibility in scoring if user does not care
    ];
    preferenceScores.set(
      option.place.id,
      recommendUtils.cosineSimilarity(userVector, optionVector)
    );
  }
  return recommendUtils.normalizeScores(preferenceScores);
}

// Compare transit fare and duration using a converstion to monetary value
function calculateTransitScores(options) {
  const VALUE_OF_SECOND = 28 / (60 * 60); // $28 per hour (average US income)

  const transitScores = new Map();
  for (const option of options) {
    transitScores.set(
      option.place.id,
      1 / (option.extracted.fare + option.extracted.duration * VALUE_OF_SECOND)
    );
  }
  return recommendUtils.normalizeScores(transitScores);
}

async function calculateCommunityBoosts(profile, options) {
  const likedPlaceData = await recommendCommunity.fetchCommunityLikes(
    options.map((option) => option.place.id)
  );

  return await recommendCommunity.scoreLikedPlaces(profile, likedPlaceData);
}

function calculateWeightedScore(option, communityBoosts, weights) {
  const { interest, preference, transit } = option.scores;
  const boost = communityBoosts.get(option.place.id) || 1; // use multiplicative identity (1) if boost null
  return (
    (interest * weights.interest +
      preference * weights.preference +
      transit * weights.transit) *
    boost
  );
}

module.exports = { recommend };
