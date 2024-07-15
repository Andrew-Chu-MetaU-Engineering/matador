const isographUtils = require("./IsographUtils");
const NUM_DIRECTIONS = 8; // number of radial directions to sample
const STEP_SIZE = 500; // meters
const SAMPLES_PER_DIRECTION = 2;
const SAMPLING_DISTANCES = Array.from(
  { length: SAMPLES_PER_DIRECTION },
  (v, i) => STEP_SIZE * (i + 1)
);
const DURATION_INTERALS = [5, 10, 15, 30, 60].map((val) => val * 60); // convert min to sec
const FARE_INTERVALS = [1, 2, 5, 10, 20]; // in dollars

async function isograph(origin, costType, departureTime) {
  const { COST_TYPE_DURATION, COST_TYPE_FARE } = process.env;
  let costIntervals;
  switch (costType) {
    case COST_TYPE_DURATION:
      costIntervals = DURATION_INTERALS;
      break;
    case COST_TYPE_FARE:
      costIntervals = FARE_INTERVALS;
      break;
  }

  let sampleInfo = Array.from({ length: NUM_DIRECTIONS }, (v, i) => {
    const direction = (360 / NUM_DIRECTIONS) * i;
    return {
      coordinates: SAMPLING_DISTANCES.map((distance) =>
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

  const predictions = sampleInfo
    .map((directionalSamples) =>
      isographUtils
        .predictCostDistances(
          directionalSamples.costs,
          SAMPLING_DISTANCES,
          costIntervals
        )
        .map(([cost, predictedDistance]) => {
          const predictedLocation = isographUtils.findCoordinate(
            origin,
            predictedDistance,
            directionalSamples.direction
          );
          return {
            lat: predictedLocation[0],
            lng: predictedLocation[1],
            cost: cost,
          };
        })
    )
    .flat();

  const groupedPredictions = new Map();
  predictions.forEach((prediction) => {
    if (!groupedPredictions.get(prediction.cost)) {
      groupedPredictions.set(prediction.cost, []);
    }
    groupedPredictions
      .get(prediction.cost)
      .push({ lat: prediction.lat, lng: prediction.lng });
  });
  return Object.fromEntries(groupedPredictions);
}

module.exports = { isograph };
