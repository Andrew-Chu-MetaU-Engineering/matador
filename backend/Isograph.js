const isographUtils = require("./IsographUtils");
const NUM_DIRECTIONS = 8; // number of radial directions to sample
const STEP_SIZE = 100; // meters
const ACCEPTABLE_FARE_DIFF = 2; // dollars
const ACCEPTABLE_DURATION_DIFF = 5 * 60; // seconds
const MAX_SAMPLES_PER_DIRECTION = 2;

async function isograph(origin, targetVal, costType, departureTime) {
  let sampleInfo = Array.from({ length: NUM_DIRECTIONS }, (v, i) => ({
    points: new Map(),
    completed: false,
    nextDistance: STEP_SIZE,
    direction: (360 / NUM_DIRECTIONS) * i, // degrees clockwise from north
  }));

  for (let id = 0; id < MAX_SAMPLES_PER_DIRECTION; id++) {
    let samplePoints = sampleInfo.map((sample) =>
      isographUtils.findCoordinate(
        origin,
        sample.nextDistance,
        sample.direction
      )
    );

    const sampleCosts = await isographUtils.fetchCosts(
      origin,
      samplePoints,
      costType,
      departureTime
    );

    sampleInfo.forEach((sample, i) => {
      const [point, cost] = sampleCosts[i];
      sample.points.set(point, cost);
      sample.nextDistance += STEP_SIZE;
      if (costType === "duration") {
        sample.completed =
          Math.abs(cost - targetVal) < ACCEPTABLE_DURATION_DIFF;
      } else if (costType === "fare") {
        sample.completed = Math.abs(cost - targetVal) < ACCEPTABLE_FARE_DIFF;
      }
    });
  }
  return isographUtils.get3DPoints(sampleInfo);
}

module.exports = { isograph };
