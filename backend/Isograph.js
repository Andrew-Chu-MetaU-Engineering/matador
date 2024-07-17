const isographUtils = require("./IsographUtils");
const {
  NUM_DIRECTIONS, // number of radial directions to sample
  SAMPLES_PER_DIRECTION,
  STEP_SIZE, // increments to sample, in meters
  POLYNOMIAL_ORDER,
  POLYNOMIAL_DIMENSIONAL_SAMPLE_COUNT, // number of samples to take along each side of lat/lng grid
} = process.env;
const SAMPLING_DISTANCES = Array.from(
  { length: SAMPLES_PER_DIRECTION },
  (v, i) => STEP_SIZE * (i + 1)
);

async function isograph(originAddress, costType, departureTime) {
  const originCoordinates = await isographUtils.geocode(originAddress);

  let sampleInfo = Array.from({ length: NUM_DIRECTIONS }, (v, i) => {
    const direction = (360 / NUM_DIRECTIONS) * i;
    return {
      coordinates: SAMPLING_DISTANCES.map((distance) =>
        isographUtils.findCoordinate(originCoordinates, distance, direction)
      ),
      direction: direction, // degrees clockwise from north
      costs: [],
    };
  });

  // costs field filled separately for async/await concurrency
  await isographUtils.insertSampleCosts(
    sampleInfo,
    originCoordinates,
    costType,
    departureTime
  );
  const costSamples = sampleInfo
    .map((directionalSamples) =>
      directionalSamples.coordinates.map((coordinate, i) => [
        ...coordinate,
        directionalSamples.costs[i],
      ])
    )
    .flat();

  const estimations = await isographUtils.fetchPolynomialEstimation(
    costSamples,
    POLYNOMIAL_ORDER,
    POLYNOMIAL_DIMENSIONAL_SAMPLE_COUNT
  );
  return estimations.estimates;
}

module.exports = { isograph };
