const isographUtils = require("./IsographUtils");
const NUM_DIRECTIONS = 2; // number of radial directions to sample
const STEP_SIZE = 500; // meters
const SAMPLES_PER_DIRECTION = 2;
const DISTANCES = Array.from(
  { length: SAMPLES_PER_DIRECTION },
  (v, i) => STEP_SIZE * (i + 1)
);
const DURATION_INTERALS = [5, 10, 15, 30, 60].map((val) => val * 60); // convert min to sec 
const FARE_INTERVALS = [1, 2, 5, 10, 20]; // in dollars

async function isograph(origin, costType, departureTime) {
  let sampleInfo = Array.from({ length: NUM_DIRECTIONS }, (v, i) => {
    const direction = (360 / NUM_DIRECTIONS) * i;
    return {
      coordinates: DISTANCES.map((distance) =>
        isographUtils.findCoordinate(origin, distance, direction)
      ),
      direction: direction, // degrees clockwise from north
      costs: [],
    };
  });

  const costs = await Promise.all(
    sampleInfo.map((directionalSamples) =>
      isographUtils.fetchCosts(
        origin,
        directionalSamples.coordinates,
        costType,
        departureTime
      )
    )
  );

  sampleInfo.forEach((sampleDirection, i) => {
    sampleDirection.costs = costs[i];
  });

  return sampleInfo
    .map((directionalSamples) =>
      isographUtils
        .predictCostDistances(
          directionalSamples.costs,
          DISTANCES,
          DURATION_INTERALS
        )
        .map(([cost, predictedDistance]) => [
          ...isographUtils.findCoordinate(
            origin,
            predictedDistance,
            directionalSamples.direction
          ),
          cost,
        ])
    )
    .flat();
}

module.exports = { isograph };
