const express = require("express");
const cors = require("cors");
const utils = require("./FetchResultsUtils");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const { PORT } = process.env;

app.get("/", (req, res, next) => {
  res.send("Matador API");
  next();
});

app.get("/recommend", async (req, res) => {
  try {
    const { searchQuery, originAddress, centerLatitude, centerLongitude } =
      req.query;
    const options = await utils.getOptions(
      searchQuery,
      originAddress,
      centerLatitude,
      centerLongitude
    );
    res.status(200).send(utils.recommend(options));
  } catch (error) {
    res.status(500);
  }
});

app.get("/gComputeRoutes", async (req, res) => {
  try {
    const data = await utils.fetchRoute(
      req.query.originAddress,
      req.query.destinationAddress
    );
    res.status(200).send(data);
  } catch (error) {
    res.status(500);
  }
});

app.get("/gNearbyPlaces", async (req, res) => {
  try {
    const data = await utils.fetchPlaces(
      req.query.searchQuery,
      req.query.centerLatitude,
      req.query.centerLongitude
    );
    res.status(200).send(data);
  } catch (error) {
    res.status(500);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
