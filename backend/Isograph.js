const isographUtils = require("./IsographUtils");
const {
  NUM_DIRECTIONS, // number of radial directions to sample
  SAMPLES_PER_DIRECTION,
  STEP_SIZE, // increments to sample, in meters
  POLYNOMIAL_ORDER,
  POLYNOMIAL_DIMENSIONAL_SAMPLE_COUNT, // number of samples to take along each side of lat/lng grid
  COST_TYPE_DURATION,
  COST_TYPE_FARE,
} = process.env;
const SAMPLING_DISTANCES = Array.from(
  { length: SAMPLES_PER_DIRECTION },
  (v, i) => STEP_SIZE * (i + 1)
);
const COST_TYPES = [COST_TYPE_DURATION, COST_TYPE_FARE];

/**
 * Samples the cost (fare or duration) to get to coordinates around the origin address,
 *  then fetches points from polynomial regression model fitted to the cost
 *  samples from a FastAPI server.
 * Any points in the polynomial regression model that are negative are clipped to 0.
 */
async function isograph(originAddress, departureTime) {
  const originCoordinates = await isographUtils.geocode(originAddress);

  // Each element of sampleInfo holds sample points for a single radial direction
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
    departureTime
  );

  const polynomialEstimates = await Promise.all(
    COST_TYPES.map((costType) => {
      const costPoints = isographUtils.extractCostPoints(
        sampleInfo,
        originCoordinates,
        costType
      );

      return isographUtils.fetchPolynomialEstimation(
        costPoints,
        POLYNOMIAL_ORDER,
        POLYNOMIAL_DIMENSIONAL_SAMPLE_COUNT
      );
    })
  );
  return Object.fromEntries(
    COST_TYPES.map((costType, i) => [
      costType,
      polynomialEstimates[i].estimates,
    ])
  );
}

module.exports = { isograph };
