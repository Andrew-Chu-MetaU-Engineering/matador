const express = require("express");
const cors = require("cors");
const utils = require("./FetchResultsUtils");
require("dotenv").config();

const googleApiRoute = require("./routes/googleAPI");
const { router: userRoute, getUser } = require("./routes/user");

const app = express();
app.use(express.json());
app.use(cors());

const { PORT } = process.env;

app.get("/", (req, res, next) => {
  res.send("Matador API");
  next();
});

app.use("/google", googleApiRoute);
app.use("/user", userRoute);

app.get("/recommend", async (req, res) => {
  try {
    const {
      user: userId,
      searchQuery,
      originAddress,
      centerLatitude,
      centerLongitude,
    } = req.query;
    const options = await utils.getOptions(
      searchQuery,
      originAddress,
      centerLatitude,
      centerLongitude
    );
    const profile = await getUser(userId);
    res.status(200).send(utils.recommend(profile, options));
  } catch (error) {
    res.status(500);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
