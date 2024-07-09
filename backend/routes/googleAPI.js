const express = require("express");
const router = express.Router();

const utils = require("../FetchResultsUtils");

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

router.get("/computeRouteMatrix", async (req, res) => {
  try {
    const data = await utils.fetchRouteMatrix(
      req.query.originAddress,
      req.query.destinationAddresses
    );
    res.status(200).send(data);
  } catch (error) {
    res.status(500);
  }
});

module.exports = router;
