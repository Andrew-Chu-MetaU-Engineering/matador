require("dotenv").config();
const {
  GOOGLE_API_KEY,
  COMPUTE_ROUTES_ENDPOINT,
  TEXTSEARCH_PLACES_ENDPOINT,
  NEARBY_SEARCH_RADIUS_METERS,
  MAX_NUM_PLACES_RESULTS,
} = process.env;

async function fetchRoute(originAddress, destinationAddress) {
  // computes route from origin to destination and their related transit fares and durations
  const response = await fetch(new URL(COMPUTE_ROUTES_ENDPOINT), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_API_KEY,
      "X-Goog-FieldMask":
        "routes.duration,routes.polyline,routes.travel_advisory.transitFare,routes.legs.stepsOverview",
    },
    body: JSON.stringify({
      origin: {
        address: originAddress,
      },
      destination: {
        address: destinationAddress,
      },
      travelMode: "TRANSIT",
      computeAlternativeRoutes: false,
    }),
  });
  return await response.json();
}

async function fetchPlaces(searchQuery, centerLatitude, centerLongitude) {
  // retrieves locations matching query text, with a bias toward a geographical radius
  const response = await fetch(new URL(TEXTSEARCH_PLACES_ENDPOINT), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_API_KEY,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress",
    },
    body: JSON.stringify({
      textQuery: searchQuery,
      locationBias: {
        circle: {
          center: {
            latitude: centerLatitude,
            longitude: centerLongitude,
          },
          radius: NEARBY_SEARCH_RADIUS_METERS,
        },
      },
      pageSize: MAX_NUM_PLACES_RESULTS,
    }),
  });
  return await response.json();
}

async function getOptions(
  searchQuery,
  originAddress,
  centerLatitude,
  centerLongitude
) {
  const { places } = await fetchPlaces(
    searchQuery,
    centerLatitude,
    centerLongitude
  );

  const routesPromises = places.map((place) =>
    fetchRoute(originAddress, place.formattedAddress)
  );
  const routes = await Promise.all(routesPromises);

  let options = [];
  for (const [i, place] of places.entries()) {
    for (const route of routes[i].routes) {
      let placeRoutes = {
        place: place,
        route: route,
      };
      options.push(placeRoutes);
    }
  }
  return options;
}

function parseDuration(route) {
  return parseInt(route.duration, 10);
}

function calculateFare(route) {
  const { units = 0, nanos = 0 } = route.travelAdvisory.transitFare;
  return parseInt(units) + nanos * 10 ** -9;
}

function recommend(profile, options) {
  // TODO build out the recommendation system
  // TODO use profile
  options.sort((a, b) =>
    calculateFare(a.route) === calculateFare(b.route)
      ? parseDuration(a.route) - parseDuration(b.route)
      : calculateFare(a.route) - calculateFare(b.route)
  );
  return options;
}

module.exports = {
  fetchRoute,
  fetchPlaces,
  getOptions,
  recommend,
};
