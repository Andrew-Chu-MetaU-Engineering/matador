const fetchResultsUtils = require("./FetchResultsUtils");
const {
  GOOGLE_API_KEY,
  GEOCODING_ENDPOINT,
  COST_TYPE_DURATION,
  COST_TYPE_FARE,
  COST_TYPE_ERROR_MSG,
  ISOGRAPHS_API,
} = process.env;

// Convert a plain text address to a coordinate, for use in isograph sampling
async function geocode(originAddress) {
  try {
    let request = new URL(GEOCODING_ENDPOINT);
    request.searchParams.append("address", originAddress);
    request.searchParams.append("key", GOOGLE_API_KEY);

    const response = await fetch(request);
    if (!response.ok) {
      throw new Error(`HTTP error. Status ${response.status}`);
    }

    const geocodeData = await response.json();
    if (geocodeData?.results.length === 0) {
      throw new Error(`Geocoding failed.`);
    }

    const coordinate = geocodeData.results[0].geometry.location;
    return [coordinate.lat, coordinate.lng];
  } catch (error) {
    console.error(error.message);
  }
}

/**
 * Given an origin coordinate, a distance in meters, and a direction
 *  in degrees from north, find the corresponding coordinate point
 */
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

/**
 * Fetches and inserts costs into sampleInfo from Google RouteMatrix
 * between origin and destination coordinates concurrently
 */
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

async function fetchCosts(origin, samplePoints, costType, departureTime) {
  try {
    const routesData = await fetchResultsUtils.fetchRouteMatrix(
      origin,
      samplePoints,
      departureTime,
      true
    );

    if (costType === COST_TYPE_DURATION) {
      return routesData.map(
        (route) => fetchResultsUtils.parseDuration(route) / 60
      ); // convert to minutes
    } else if (costType === COST_TYPE_FARE) {
      return routesData.map((route) => fetchResultsUtils.calculateFare(route));
    } else {
      console.error(COST_TYPE_ERROR_MSG);
    }
  } catch (error) {
    console.error(error.message);
  }
}

// Fetch points from the polynomial regression, fitted using the cost samples
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
    console.error(error.message);
  }
}

module.exports = {
  geocode,
  findCoordinate,
  insertSampleCosts,
  fetchPolynomialEstimation,
};
