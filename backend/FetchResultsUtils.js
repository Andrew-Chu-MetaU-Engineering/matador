require("dotenv").config();
const {
  GOOGLE_API_KEY,
  COMPUTE_ROUTES_ENDPOINT,
  COMPUTE_ROUTEMATRIX_ENDPOINT,
  TEXTSEARCH_PLACES_ENDPOINT,
} = process.env;

async function fetchRoute(originAddress, destinationAddress, departureTime) {
  // computes route from origin to destination and their related transit fares and durations
  try {
    const FIELDS = ["routes.polyline", "routes.legs", "routes.viewport"];

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
        departureTime: departureTime,
      }),
    });
    return await response.json();
  } catch (error) {
    console.log(error.message);
  }
}

async function fetchRouteMatrix(
  originAddress,
  destinationAddresses,
  departureTime
) {
  // computes route from origin to destination and their related transit fares and durations
  try {
    const FIELDS = ["duration", "travel_advisory.transitFare", "condition"];

    const requestBody = {
      origins: {
        waypoint: {
          address: originAddress,
        },
      },
      travelMode: "TRANSIT",
      departureTime: departureTime,
    };

    requestBody.destinations = Object.values(
      destinationAddresses.map((address) => ({
        waypoint: {
          address: address,
        },
      }))
    );

    const response = await fetch(new URL(COMPUTE_ROUTEMATRIX_ENDPOINT), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": FIELDS.join(),
      },
      body: JSON.stringify(requestBody),
    });
    return await response.json();
  } catch (error) {
    console.log(error.message);
  }
}

async function fetchPlaces(
  searchQuery,
  locationBiasRect,
  numRequests,
  isFirstRequest,
  nextPageToken = null
) {
  // retrieves locations matching query text, with a bias toward a geographical radius
  const FIELDS = [
    "nextPageToken",
    "places.id",
    "places.displayName.text",
    "places.types",
    "places.formattedAddress",
    "places.rating",
    "places.priceLevel",
    "places.currentOpeningHours.periods",
    "places.utcOffsetMinutes",
    "places.editorialSummary",
    "places.goodForChildren",
    "places.goodForGroups",
    "places.accessibilityOptions",
  ];
  const requestBody = {
    textQuery: searchQuery,
    locationBias: {
      rectangle: {
        ...locationBiasRect,
      },
    },
    pageSize: numRequests,
  };

  if (!isFirstRequest) {
    if (nextPageToken == null) {
      return {};
    } else {
      requestBody.pageToken = nextPageToken;
    }
  }

  const response = await fetch(new URL(TEXTSEARCH_PLACES_ENDPOINT), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_API_KEY,
      "X-Goog-FieldMask": FIELDS.join(),
    },
    body: JSON.stringify(requestBody),
  });
  return await response.json();
}

async function getOptions(
  searchQuery,
  originAddress,
  locationBias,
  departureTime,
  numRequests,
  isFirstRequest,
  nextPageToken = null
) {
  const { places, nextPageToken: newNextPageToken } = await fetchPlaces(
    searchQuery,
    locationBias,
    numRequests,
    isFirstRequest,
    nextPageToken
  );

  const routesData = await fetchRouteMatrix(
    originAddress,
    places.map((place) => place.formattedAddress),
    departureTime
  );

  const options = places.map((place, i) => {
    const route = routesData[i];
    return {
      place: place,
      extracted: {
        priceLevel: parsePriceLevel(place),
        accessibilityScore: parseAccessibility(place),
        fare: calculateFare(route),
        duration: parseDuration(route),
      },
    };
  });

  return { options: options, nextPageToken: newNextPageToken };
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

module.exports = {
  fetchRoute,
  fetchRouteMatrix,
  fetchPlaces,
  getOptions,
};
