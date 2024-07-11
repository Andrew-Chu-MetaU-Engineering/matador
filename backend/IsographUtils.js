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

function get3DPoints(sampleInfo) {
  return sampleInfo
    .map((sample) => Array.from(sample.points).map(([k, v]) => [k[0], k[1], v]))
    .flat();
}

module.exports = {
  findCoordinate,
  fetchCosts,
  get3DPoints,
};
