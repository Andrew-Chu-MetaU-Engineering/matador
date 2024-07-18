const fetchUtils = require("./FetchResultsUtils");
const { MAX_FETCH_TRIES, BIAS, NEAR_INTEREST_THRESHOLD } = process.env;

async function getTransformer() {
  TransformersApi = Function('return import("@xenova/transformers")')();
  const { pipeline } = await TransformersApi;

  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );
  return extractor;
}

function getEmbedder(extractor) {
  return async (text) => {
    const output = await extractor(text, {
      pooling: "mean",
      normalize: true,
    });
    return output.data;
  };
}

function dot(vecA, vecB) {
  let sum = 0;
  for (let i = 0; i < vecA.length; i++) {
    sum += vecA[i] * vecB[i];
  }
  return sum;
}

function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must be of the same length.");
  }

  return (
    dot(vecA, vecB) / (Math.sqrt(dot(vecA, vecA)) * Math.sqrt(dot(vecB, vecB)))
  );
}

async function getAlignedInterests(queryEmbedding, interests, getEmbedding) {
  const interestEmbeddingPromises = interests.map((interest) =>
    getEmbedding(interest)
  );
  const interestEmbeddings = await Promise.all(interestEmbeddingPromises);
  return interests.filter(
    (interest, i) =>
      cosineSimilarity(queryEmbedding, interestEmbeddings[i]) >=
      NEAR_INTEREST_THRESHOLD
  );
}

function constructTimePoint(point, utcOffsetMinutes) {
  const { hour, minute, date } = point;
  let time = new Date(
    Date.UTC(date.year, date.month - 1, date.day, hour, minute)
  );
  time.setMinutes(time.getMinutes() + utcOffsetMinutes);
  return time;
}

function isOpenOnArrival(
  departureTime,
  transitDuration,
  openingHours,
  utcOffsetMinutes
) {
  // incomplete hours data should not hurt recommendation rankings
  if (openingHours?.periods?.length < 7) {
    // check if >=1 day of the week has missing hours data
    return true;
  }
  let arrivalTime = new Date(departureTime);
  arrivalTime.setSeconds(arrivalTime.getSeconds() + transitDuration);

  let { open, close } = openingHours.periods[arrivalTime.getDay()];
  return (
    constructTimePoint(open, utcOffsetMinutes) <
    arrivalTime <
    constructTimePoint(close, utcOffsetMinutes)
  );
}

function isFeasible(option, settings) {
  const {
    place: { rating, currentOpeningHours, utcOffsetMinutes },
    extracted: { fare, duration, priceLevel },
  } = option;
  const { departureTime, preferredFare, preferredDuration, budget, minRating } =
    settings;
  return !(
    (preferredFare.isStrong && fare > preferredFare.fare) ||
    (preferredDuration.isStrong && duration > preferredDuration.duration) ||
    priceLevel > budget ||
    rating < minRating ||
    !isOpenOnArrival(
      departureTime,
      duration,
      currentOpeningHours,
      utcOffsetMinutes
    )
  );
}

async function fetchRecommendations(numRecommendations, settings, query) {
  let tries = 0;
  let nextPageToken = null;
  let isInitialFetch = true;

  let options = [];
  while (options.length < numRecommendations && tries < MAX_FETCH_TRIES) {
    let { options: fetchedOptions, nextPageToken: refetchNextPageToken } =
      await fetchUtils.getOptions(
        query,
        settings.originAddress,
        settings.locationBias,
        settings.departureTime,
        numRecommendations - options.length,
        isInitialFetch,
        nextPageToken
      );

    if (fetchedOptions.length === 0) {
      break;
    } else {
      options.push(
        ...fetchedOptions.filter((option) => isFeasible(option, settings))
      );
      nextPageToken = refetchNextPageToken;
    }

    if (nextPageToken == null) break;
    if (isInitialFetch) isInitialFetch = false;
    tries += 1;
  }

  await insertRouteDetails(
    options,
    settings.originAddress,
    settings.departureTime
  );
  return options;
}

async function insertRouteDetails(options, originAddress, departureTime) {
  let routePromises = options.map((option) =>
    fetchUtils.fetchRoute(
      originAddress,
      option.place.formattedAddress,
      departureTime
    )
  );
  const routes = await Promise.all(routePromises);
  options.forEach((option, i) => (option.route = routes[i].routes[0]));
}

function biasPreference(value, isDownward) {
  // takes input values in [0, 1]
  return isDownward ? value ** (1 / BIAS) : value ** BIAS;
}

function normalizeScores(scoresMap) {
  const scores = [...scoresMap.values()];
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  scoresMap.forEach((val, key) =>
    scoresMap.set(key, (val - minScore) / (maxScore - minScore))
  );
  return scoresMap;
}

module.exports = {
  getTransformer,
  getEmbedder,
  cosineSimilarity,
  getAlignedInterests,
  fetchRecommendations,
  biasPreference,
  normalizeScores,
};
