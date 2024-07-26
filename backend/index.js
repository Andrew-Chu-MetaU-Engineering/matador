const express = require("express");
const cors = require("cors");
const recommender = require("./Recommend");
const isograph = require("./Isograph");
require("dotenv").config();

const { router: userRoute, getUser } = require("./routes/user");
const { router: likedPlaceRoute } = require("./routes/place");

const app = express();
app.use(express.json());
app.use(cors());

const { PORT } = process.env;

app.get("/", (req, res, next) => {
  res.send("Matador API");
  next();
});

app.use("/user", userRoute);
app.use("/likedPlace", likedPlaceRoute);

app.get("/recommend", async (req, res) => {
  try {
    const { userId, searchQuery, settings } = req.query;
    const profile = await getUser(userId);
    const options = await recommender.recommend(
      searchQuery,
      profile,
      JSON.parse(settings),
    );
    res.status(200).send(options);
  } catch (error) {
    res.status(500);
  }
});

app.get("/isograph", async (req, res) => {
  try {
    const { originAddress, costType, departureTime } = req.query;
    const isographData = await isograph.isograph(
      originAddress,
      costType,
      departureTime
    );
    res.status(200).send(isographData);
  } catch (error) {
    res.status(500);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
