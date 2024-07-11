const fetchResultsUtils = require("./FetchResultsUtils");

const NUM_DIRECTIONS = 2; // number of radial directions to sample
const STEP_SIZE = 100; // meters
const ACCEPTABLE_FARE_DIFF = 2; // dollars
const ACCEPTABLE_DURATION_DIFF = 5 * 60; // seconds
const MAX_RETRIES_PER_DIRECTION = 2;
const EARTH_RADIUS = 6371000; // meters

async function isograph(origin, targetVal, costType, departureTime) {
  let sampleInfo = Array.from({ length: NUM_DIRECTIONS }, (v, i) => ({
    points: new Map(),
    completed: false,
    nextDistance: STEP_SIZE,
    direction: (360 / NUM_DIRECTIONS) * i, // degrees clockwise from north
  }));

  for (let id = 0; id < MAX_RETRIES_PER_DIRECTION; id++) {
    let samplePoints = sampleInfo.map((sample) =>
      sample.completed
        ? null
        : findCoordinate(origin, sample.nextDistance, sample.direction)
    );

    const sampleCosts = await fetchCosts(
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
}

function findCoordinate(origin, distance, direction) {
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

  return routesData.map((route, i) => [
    samplePoints[i],
    parseCostFunction(route),
  ]);
}
