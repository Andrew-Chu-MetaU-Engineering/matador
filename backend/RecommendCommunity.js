const recommendUtils = require("./RecommendUtils");
const { getPlaceLikes } = require("./routes/place");

async function fetchCommunityLikes(placeIds) {
  const likePlaceDataPromises = placeIds.map((placeId) =>
    getPlaceLikes(placeId)
  );
  const likedPlaceData = await Promise.all(likePlaceDataPromises);
  return Object.fromEntries(
    placeIds.map((placeId, i) => [placeId, likedPlaceData[i]])
  );
}

async function scoreLikedPlaces(primaryUser, likedPlaceData) {
  // set up for userInterestSimilarity
  const transformer = await recommendUtils.getTransformer();
  const getEmbedding = recommendUtils.getEmbedder(transformer);
  const primaryUserInterestEmbedding = await getEmbedding(
    primaryUser.interests.join()
  );

  // add users to a set to prevent duplicate comparisons, but convert back to array for use in Promise.all
  const otherUsers = Array.from(
    new Set(
      Object.values(likedPlaceData)
        .map((placeData) => (placeData == null ? [] : placeData.users))
        .flat()
        .filter((user) => user.id !== primaryUser.id)
    )
  );

  const otherUsersSimilarity = await Promise.all(
    otherUsers.map((otherUser) =>
      userSimilarity(
        otherUser,
        primaryUserInterestEmbedding,
        primaryUser.likedPlaces,
        getEmbedding
      )
    )
  );
  const otherUsersSimilarityMap = new Map(
    otherUsers.map((user, i) => [user.id, otherUsersSimilarity[i]])
  );

  const scores = new Map();
  for (const [placeId, place] of Object.entries(likedPlaceData)) {
    scores.set(
      placeId,
      place?.users != null
        ? calculatePlaceScore(
            place.users.filter((user) => user.id !== primaryUser.id), // disregard own like in community rankings
            otherUsersSimilarityMap
          )
        : null
    );
  }
  return scores;
}

async function userSimilarity(
  otherUser,
  primaryUserInterestEmbedding,
  primaryUserLikedPlaces,
  getEmbedding
) {
  const interestSimilarity = await userInterestSimilarity(
    otherUser.interests,
    primaryUserInterestEmbedding,
    getEmbedding
  );

  const likeSimilarity = userLikeSimilarity(
    primaryUserLikedPlaces.map((place) => place.id),
    otherUser.likedPlaces.map((place) => place.id)
  );

  const similarityScores = [interestSimilarity, likeSimilarity];
  return (
    similarityScores.reduce((sum, val) => sum + val) / similarityScores.length
  );
}

async function userInterestSimilarity(
  otherUserInterests,
  primaryUserInterestEmbedding,
  getEmbedding
) {
  if (otherUserInterests.length === 0) {
    return 0;
  }

  return recommendUtils.cosineSimilarity(
    await getEmbedding(otherUserInterests.join()),
    primaryUserInterestEmbedding
  );
}

function userLikeSimilarity(primaryUserLikes, otherUserLikes) {
  if (primaryUserLikes.length === 0 || otherUserLikes.length === 0) {
    return 0;
  }

  // compare proportions of interests in common
  return (
    // take size of intersection over size of union
    primaryUserLikes.filter((likedPlace) => otherUserLikes.includes(likedPlace))
      .length / new Set([...primaryUserLikes, ...otherUserLikes]).size
  );
}

function calculatePlaceScore(likeUsers, otherUsersSimilarityMap) {
  if (likeUsers.length === 0) return null;

  const userScores = likeUsers.map((user) =>
    otherUsersSimilarityMap.get(user.id) + 1 // each user like should be >= 1
  );

  // use sqrt to reduce large values, with sqrt(x+1) to set y-intercept at 1
  return Math.sqrt(userScores.reduce((sum, val) => sum + val) + 1);
}

module.exports = {
  fetchCommunityLikes,
  scoreLikedPlaces,
};
