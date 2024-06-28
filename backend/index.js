const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());

require("dotenv").config();
const {
  GOOGLE_API_KEY,
  PORT,
  COMPUTE_ROUTES_ENDPOINT,
  TEXTSEARCH_PLACES_ENDPOINT,
  NEARBY_SEARCH_RADIUS_METERS,
  MAX_NUM_PLACES_RESULTS,
} = process.env;

app.get("/", (req, res, next) => {
  res.send("Matador API");
  next();
});

app.get("/gComputeRoutes", async (req, res) => {
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
          address: req.query.originAddress,
        },
        destination: {
          address: req.query.destinationAddress,
        },
        travelMode: "TRANSIT",
        computeAlternativeRoutes: false,
      }),
    });
    const data = await response.json();
    res.status(200).send(data);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

app.get("/gNearbyPlaces", async (req, res) => {
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
        textQuery: req.query.searchQuery,
        maxResultCount: 10,
        locationBias: {
          circle: {
            center: {
              latitude: req.query.centerLatitude,
              longitude: req.query.centerLongitude,
            },
            radius: NEARBY_SEARCH_RADIUS_METERS,
          },
        },
        pageSize: MAX_NUM_PLACES_RESULTS,
      }),
    });
    const data = await response.json();
    res.status(200).send(data);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
