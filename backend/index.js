const express = require("express");
const app = express();

require("dotenv").config();
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const PORT = process.env.PORT;

app.get("/", (req, res, next) => {
  res.send("Matador API");
  next();
});

app.get("/gComputeRoutes", async (req, res) => {
  // computes routes from origin to destination and their related transit fares and durations
  try {
    const response = await fetch(new URL(process.env.COMPUTE_ROUTES_ENDPOINT), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask":
          "routes.duration,routes.polyline,routes.travel_advisory.transitFare,routes.legs.stepsOverview",
      },
      body: JSON.stringify({
        origin: {
          address: "749 W El Camino Real 1st Flr, Mountain View, CA 94040",
        },
        destination: {
          address: "Safeway, 645 San Antonio Rd, Mountain View, CA 94040",
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
    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_API_KEY,
          "X-Goog-FieldMask": "places.displayName,places.formattedAddress",
        },
        body: JSON.stringify({
          textQuery: "ramen restaurants in mountain view",
          maxResultCount: 10,
          locationBias: {
            circle: {
              center: {
                latitude: 37.3888,
                longitude: -122.0823,
              },
              radius: 500,
            },
          },
          pageSize: process.env.MAX_NUM_PLACES_RESULTS,
        }),
      }
    );
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
