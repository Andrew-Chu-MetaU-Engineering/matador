require("dotenv").config();
const {
  GOOGLE_API_KEY,
  COMPUTE_ROUTES_ENDPOINT,
  COMPUTE_ROUTEMATRIX_ENDPOINT,
  TEXTSEARCH_PLACES_ENDPOINT,
} = process.env;

const PLACES_ACCESSIBILITY_FIELDS = [
  "wheelchairAccessibleParking",
  "wheelchairAccessibleEntrance",
  "wheelchairAccessibleRestroom",
  "wheelchairAccessibleSeating",
];

/**
 * Get a list of potential recommendations based on the user's query and settings
 * @returns An object with options, a list of places based on the user's
 *  query and location bias and their corresponding route fare/durations,
 *  and nextPageToken, which allows for refetching if certain options are not deemed feasible.
 */
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

  if (places?.length == 0) {
    return { options: [], nextPageToken: null };
  }

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

/**
 * Computes route from origin to destination
 * and its shape, navigation steps, and viewport boundaries for display
 */
async function fetchRoute(originAddress, destinationAddress, departureTime) {
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

    if (!response.ok) {
      throw new Error(`HTTP error on Routes. Status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error.message);
  }
}

/**
 * Computes routes from one origin to multiple destinations
 *  and their related transit fares and durations
 * @returns Transit fares and durations for each route in the same order
 *  as the elements in the input destinations array
 */
async function fetchRouteMatrix(
  origin,
  destinations,
  departureTime,
  useCoordinates = false
) {
  try {
    const FIELDS = [
      "destinationIndex",
      "duration",
      "travel_advisory.transitFare",
      "condition",
    ];

    const requestBody = {
      travelMode: "TRANSIT",
    };
    if (departureTime) requestBody.departureTime = departureTime;

    if (useCoordinates) {
      requestBody.origins = {
        waypoint: {
          location: {
            latLng: { latitude: origin[0], longitude: origin[1] },
          },
        },
      };
      requestBody.destinations = Object.values(
        destinations.map((coordinate) => ({
          waypoint: {
            location: {
              latLng: { latitude: coordinate[0], longitude: coordinate[1] },
            },
          },
        }))
      );
    } else {
      requestBody.origins = {
        waypoint: {
          address: origin,
        },
      };
      requestBody.destinations = Object.values(
        destinations.map((address) => ({
          waypoint: {
            address: address,
          },
        }))
      );
    }

    const response = await fetch(new URL(COMPUTE_ROUTEMATRIX_ENDPOINT), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": FIELDS.join(),
      },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      throw new Error(`HTTP error on RouteMatrix. Status ${response.status}`);
    }
    const routeMatrix = await response.json();
    return routeMatrix.sort((a, b) => a.destinationIndex - b.destinationIndex);
  } catch (error) {
    console.error(error.message);
  }
}

/**
 * Retrieves attribute information on places of interest matching query text,
 *  with a bias toward a geographical area specified in locationBiasRect
 */
async function fetchPlaces(
  searchQuery,
  locationBiasRect,
  numRequests,
  isFirstRequest,
  nextPageToken = null
) {
  try {
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
    if (!response.ok) {
      throw new Error(`HTTP error on Places. Status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(error.message);
  }
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
  if (place?.accessibilityOptions == null) {
    return 0;
  }

  return (
    Object.entries(place.accessibilityOptions).filter(
      ([k, v]) => PLACES_ACCESSIBILITY_FIELDS.includes(k) && v
    ).length / PLACES_ACCESSIBILITY_FIELDS.length
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
  getOptions,
  fetchRoute,
  fetchRouteMatrix,
  fetchPlaces,
  parseDuration,
  calculateFare,
};
