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
  const FIELDS = [
    "routes.duration",
    "routes.polyline",
    "routes.travel_advisory.transitFare",
    "routes.legs.stepsOverview",
    "routes.viewport",
  ];

  const response = await fetch(new URL(COMPUTE_ROUTES_ENDPOINT), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_API_KEY,
      "X-Goog-FieldMask": FIELDS.join(),
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
  const FIELDS = [
    "places.id",
    "places.displayName",
    "places.types",
    "places.formattedAddress",
    "places.rating",
    "places.priceLevel",
    "places.currentOpeningHours",
    "places.editorialSummary",
    "places.goodForChildren",
    "places.goodForGroups",
    "places.accessibilityOptions",
  ];
  const response = await fetch(new URL(TEXTSEARCH_PLACES_ENDPOINT), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_API_KEY,
      "X-Goog-FieldMask": FIELDS.join(),
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

  // TODO transition to Route Matrix API
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
        extracted: {
          priceLevel: parsePriceLevel(place),
          accessibilityScore: parseAccessibility(place),
          fare: calculateFare(route),
          duration: parseDuration(route),
        },
      };
      options.push(placeRoutes);
    }
  }
  return options;
}

function parsePriceLevel(place) {
  if (place?.priceLevel == null) {
    return 0;
  }

  switch (place.priceLevel) {
    case "PRICE_LEVEL_VERY_EXPENSIVE":
      return 4;
    case "PRICE_LEVEL_EXPENSIVE":
      return 3;
    case "PRICE_LEVEL_MODERATE":
      return 2;
    case "PRICE_LEVEL_INEXPENSIVE":
      return 1;
    default:
      return 0;
  }
}

function parseAccessibility(place) {
  const TOTAL_ACCESSIBILITY_FIELDS = 4; // fields defined in Google Places API
  if (place?.accessibilityOptions == null) {
    return 0;
  }

  return (
    Object.values(place.accessibilityOptions).filter(Boolean).length /
    TOTAL_ACCESSIBILITY_FIELDS
  );
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
