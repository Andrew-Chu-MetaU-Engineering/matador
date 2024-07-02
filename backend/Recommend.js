const fetchUtils = require("./FetchResultsUtils");
const recommendUtils = require("./RecommendUtils");

async function calculateInterestScores(query, interests, options) {
  const transformer = await recommendUtils.getTransformer();
  const getEmbedding = recommendUtils.getEmbedder(transformer);

  // TODO make awaits parallel
  const queryEmbedding = await getEmbedding(query);
  const alignedInterests = await recommendUtils.getAlignedInterests(
    queryEmbedding,
    interests,
    getEmbedding
  );

  // TODO modify how query and aligned interests are combined
  const adjustedQueryEmbedding = await getEmbedding(
    [query, ...alignedInterests].join()
  );
  const interestScores = new Map();
  for (const option of options) {
    // TODO make awaits parallel
    const descriptionEmbedding = await getEmbedding(
      option.place.displayName.text
    );
    interestScores[option.place.id] = recommendUtils.cosineSimilarity(
      adjustedQueryEmbedding,
      descriptionEmbedding
    );
  }
  return interestScores;
}

function calculatePreferenceScores(interests, settings, options) {}

function calculateTransitScores(settings, options) {}

async function recommend() {
  const QUERY = "gyms near mountain view";
  const INTERESTS = ["reading", "fine dining", "outdoor activities"];
  const SETTINGS = {
    originAddress: "900 High School Way, Mountain View, CA 94041",
    center: {
      latitude: 37.4859,
      longitude: -122.1461,
    },
    preferredFare: {
      fare: 0.5,
      isStrong: false,
    },
    preferredDuration: {
      duration: 1500,
      isStrong: true,
    },
    budget: 2,
    minRating: 4,
    goodForChildren: false,
    goodForGroups: false,
    isAccessible: true,
  };

  let query = QUERY;
  let interests = INTERESTS;
  let settings = SETTINGS;

  let options = await fetchUtils.getOptions(
    query,
    settings.originAddress,
    settings.center.latitude,
    settings.center.longitude
  );

  options = options.filter((option) =>
    recommendUtils.feasibilityFilter(option, settings)
  );
  // TODO to be implemented: refetch options if number of options is insufficient

  // interest
  const interestScores = await calculateInterestScores(
    query,
    interests,
    options
  );
  return options.sort(
    (a, b) => interestScores[a.place.id] - interestScores[b.place.id]
  );
}

recommend();
