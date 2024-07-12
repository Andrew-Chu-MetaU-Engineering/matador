const fetchResultsUtils = require("./FetchResultsUtils");

function findCoordinate(origin, distance, direction) {
  const EARTH_RADIUS = 6371000; // meters

  const deltaMetersNorth = Math.abs(distance) * Math.cos(toRadians(direction));
  const deltaMetersEast = Math.abs(distance) * Math.sin(toRadians(direction));

  const [latitude, longitude] = origin;
  return [
    latitude + (deltaMetersNorth / EARTH_RADIUS) * (180 / Math.PI),
    longitude +
      ((deltaMetersEast / EARTH_RADIUS) * (180 / Math.PI)) /
        Math.cos((latitude * Math.PI) / 180),
  ];
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

async function fetchCosts(origin, samplePoints, costType, departureTime) {
  try {
    const routesData = await fetchResultsUtils.fetchRouteMatrix(
      origin,
      samplePoints,
      departureTime,
      true
    );

    if (costType === "duration") {
      parseCostFunction = fetchResultsUtils.parseDuration;
    } else if (costType === "fare") {
      parseCostFunction = fetchResultsUtils.calculateFare;
    } else {
      console.error("Cost type not supported.");
    }
    return routesData.map((route) => parseCostFunction(route));
  } catch (error) {
    console.error(error.message);
  }
}

function predictCostDistances(costs, distances, costIntervals) {
  let predictedDistances = [];
  let currentCostIntervalIndex = 0;
  let currentCostInterval = costIntervals[currentCostIntervalIndex];

  for (let i = 0; i < costs.length; i++) {
    const cost = costs[i];
    const distance = distances[i];
    if (cost >= currentCostInterval) {
      // if prediction point is between samples, linear interpolate
      const prevCost = i === 0 ? 0 : costs[i - 1];
      const prevDist = i === 0 ? 0 : distances[i - 1];
      const slope = (distance - prevDist) / (cost - prevCost);

      predictedDistances.push([
        currentCostInterval,
        slope * (currentCostInterval - cost) + distance, // point-slope form
      ]);
      currentCostInterval = costIntervals[++currentCostIntervalIndex];
    } else {
      if (i === costs.length - 1) {
        // if prediction interval is after all samples, final sample distance is within prediction cost
        predictedDistances.push([currentCostInterval, distance]);
      }
    }
  }
  return predictedDistances;
}

module.exports = {
  findCoordinate,
  fetchCosts,
  predictCostDistances,
};
