const express = require("express");
const router = express.Router();

const utils = require("../utils");

router.use("/", (req, res, next) => {
  next();
});

router.get("/computeRoute", async (req, res) => {
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

router.get("/nearbyPlaces", async (req, res) => {
  console.log("first")
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

module.exports = router;
