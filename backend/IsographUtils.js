const fetchResultsUtils = require("./FetchResultsUtils");
const {
  COST_TYPE_DURATION,
  COST_TYPE_FARE,
  COST_TYPE_ERROR_MSG,
  ISOGRAPHS_API,
} = process.env;

function findCoordinate(origin, distance, direction) {
  const EARTH_RADIUS = 6371000; // meters
  const METERS_PER_DEGREE = EARTH_RADIUS * (Math.PI / 180);

  const deltaMetersNorth = Math.abs(distance) * Math.cos(toRadians(direction));
  const deltaMetersEast = Math.abs(distance) * Math.sin(toRadians(direction));

  const [latitude, longitude] = origin;
  return [
    latitude + deltaMetersNorth / METERS_PER_DEGREE,
    longitude +
      deltaMetersEast /
        METERS_PER_DEGREE /
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

    if (costType === COST_TYPE_DURATION) {
      parseCostFunction = fetchResultsUtils.parseDuration;
    } else if (costType === COST_TYPE_FARE) {
      parseCostFunction = fetchResultsUtils.calculateFare;
    } else {
      console.error(COST_TYPE_ERROR_MSG);
    }
    return routesData.map((route) => parseCostFunction(route));
  } catch (error) {
    console.error(error.message);
  }
}

async function insertSampleCosts(sampleInfo, origin, costType, departureTime) {
  const costs = await Promise.all(
    sampleInfo.map((directionalSamples) =>
      fetchCosts(
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
}

async function fetchPolynomialEstimation(
  costSamples,
  order,
  dimensionalSampleCount
) {
  try {
    const response = await fetch(new URL("estimate", ISOGRAPHS_API), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cost_samples: costSamples,
        order: order,
        dim_sample_count: dimensionalSampleCount,
      }),
    });

    return await response.json();
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = {
  findCoordinate,
  insertSampleCosts,
  fetchPolynomialEstimation,
};
