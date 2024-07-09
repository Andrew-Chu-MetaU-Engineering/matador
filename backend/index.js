const express = require("express");
const cors = require("cors");
const recommender = require("./Recommend");
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
    const { userId, searchQuery, settings } = req.query;
    const profile = await getUser(userId);
    const options = await recommender.recommend(
      searchQuery,
      profile.interests,
      JSON.parse(settings)
    );
    res.status(200).send(options);
  } catch (error) {
    res.status(500);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
