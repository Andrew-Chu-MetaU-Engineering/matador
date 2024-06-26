const express = require("express");
const app = express();

require("dotenv").config();
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const PORT = process.env.PORT;

app.get("/", (req, res, next) => {
  res.send("Matador API");
  next();
});

app.get("/gComputeRoutesStats", async (req, res) => {
  // computes routes from origin to destination and their related transit fares and durations
  try {
    const response = await fetch(new URL(process.env.COMPUTE_ROUTES_ENDPOINT), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": "routes.duration,routes.travel_advisory.transitFare",
      },
      body: JSON.stringify({
        origin: {
          address: "749 W El Camino Real 1st Flr, Mountain View, CA 94040",
        },
        destination: {
          address:
            "Safeway, 645 San Antonio Rd, Mountain View, CA 94040",
        },
        travelMode: "TRANSIT",
        computeAlternativeRoutes: true,
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
