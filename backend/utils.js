require("dotenv").config();
const {
  GOOGLE_API_KEY,
  COMPUTE_ROUTES_ENDPOINT,
  TEXTSEARCH_PLACES_ENDPOINT,
  NEARBY_SEARCH_RADIUS_METERS,
  MAX_NUM_PLACES_RESULTS,
} = process.env;

async function fetchRoutes(originAddress, destinationAddress) {
  // computes routes from origin to destination and their related transit fares and durations
  try {
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
  } catch (error) {
    throw error; 
  }
}

async function fetchPlaces(searchQuery, centerLatitude, centerLongitude) {
  // retrieves locations matching query text, with a bias toward a geographical radius
  try {
    const response = await fetch(new URL(TEXTSEARCH_PLACES_ENDPOINT), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress",
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
  } catch (error) {
    throw error;
  }
}

module.exports = {
  fetchRoutes,
  fetchPlaces,
};
