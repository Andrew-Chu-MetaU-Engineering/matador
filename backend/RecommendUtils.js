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

function constructTimePoint(point, utcOffsetMinutes) {
  const { hour, minute, date } = point;
  let time = new Date(
    Date.UTC(date.year, date.month - 1, date.day, hour, minute)
  );
  time.setMinutes(time.getMinutes() + utcOffsetMinutes);
  return time;
}

function openOnArrival(
  departureTime,
  transitDuration,
  openingHours,
  utcOffsetMinutes
) {
  if (openingHours.periods.length < 7) return true; // incomplete hours data should not hurt recommendation rankings
  let arrivalTime = new Date(new Date(departureTime));
  arrivalTime.setSeconds(arrivalTime.getSeconds() + transitDuration);

  let { open, close } = openingHours.periods[arrivalTime.getDay()];
  return (
    constructTimePoint(open, utcOffsetMinutes) <
    arrivalTime <
    constructTimePoint(close, utcOffsetMinutes)
  );
}

function feasibilityFilter(option, settings) {
  const {
    place: { currentOpeningHours, utcOffsetMinutes },
    extracted: { fare, duration, priceLevel, rating },
  } = option;
  const { departureTime, preferredFare, preferredDuration, budget, minRating } =
    settings;
  return !(
    (preferredFare.isStrong && fare > preferredFare.fare) ||
    (preferredDuration.isStrong && duration > preferredDuration.duration) ||
    priceLevel > budget ||
    rating > minRating ||
    !openOnArrival(
      departureTime,
      duration,
      currentOpeningHours,
      utcOffsetMinutes
    )
  );
}

async function getAlignedInterests(queryEmbedding, interests, getEmbedding) {
  const NEAR_INTEREST_THRESHOLD = 0.1;
  let nearInterests = [];
  for (const interest of interests) {
    if (
      cosineSimilarity(queryEmbedding, await getEmbedding(interest)) >=
      NEAR_INTEREST_THRESHOLD
    ) {
      nearInterests.push(interest);
    }
  }
  return nearInterests;
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
  feasibilityFilter,
  getAlignedInterests,
  normalizeScores,
};
