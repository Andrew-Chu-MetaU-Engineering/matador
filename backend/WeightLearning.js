/**
 * @param {float[]} optionScores A 2d array of [interest, preference, transit] scores
 *  in the order given by the recommendation system
 * @param {int} likedOptionIndex The index of the item which the user liked
 * @param {float[]} currentWeights An array consisting of the [interest weight, preference weight, transit weight]
 *  used to generate the recommendations associated with optionScores
 * @returns A float array that represents the adjusted values of weights
 */
function calculateNewWeights(
  optionScores,
  likedOptionIndex,
  currentWeights,
  isUnlike
) {
  if (likedOptionIndex >= optionScores.length) return currentWeights;

  let likeError = calculateError(optionScores, likedOptionIndex, isUnlike);
  if (isUnlike) {
    Object.keys(likeError).forEach((v) => (likeError[v] *= -1));
  }
  return calculateAdjustedWeights(likeError, currentWeights);
}

function calculateError(optionScores, likedOptionIndex) {
  let error = { interest: 0, preference: 0, transit: 0 };
  const likedOption = optionScores[likedOptionIndex];
  optionScores.forEach((option, rank) => {
    Object.entries(option).forEach(([scoreType, score]) => {
      const likedScoreDiff = likedOption[scoreType] - score;
      // focus on items that are out of the expected order
      if (
        (likedScoreDiff > 0 && likedOptionIndex > rank) ||
        (likedScoreDiff < 0 && likedOptionIndex < rank)
      ) {
        // squared error of score, weighted by difference in rank
        error[scoreType] += (likedOptionIndex - rank) * likedScoreDiff ** 2;
      }
    });
  });
  return error;
}

// Make sure that any additions/subtractions to the weights are balanced
function calculateAdjustedWeights(adjustment, weights) {
  const newWeights = { interest: null, preference: null, transit: null };
  const numUnadjusted = Object.values(adjustment).filter(
    (adjustVal) => adjustVal === 0
  ).length;
  if (numUnadjusted > 0) {
    // if some weights' adjustment is 0, evenly split -(total adjustments) between these unadjusted weights
    const totalAdjustment = Object.values(adjustment).reduce(
      (sum, val) => sum + val
    );
    Object.entries(adjustment).forEach(
      ([weightType, adjustVal]) =>
        (newWeights[weightType] =
          (adjustVal === 0 ? -totalAdjustment / numUnadjusted : adjustVal) +
          weights[weightType])
    );
    return newWeights;
  } else {
    // if all weights are adjusted, take the difference from the avg adjustment
    const averageAdjustment =
      Object.values(adjustment).reduce((sum, val) => sum + val) /
      Object.keys(adjustment).length;
    Object.entries(adjustment).forEach(
      ([weightType, adjustVal]) =>
        (newWeights[weightType] =
          adjustVal - averageAdjustment + weights[weightType])
    );
    return newWeights;
  }
}

module.exports = {
  calculateNewWeights,
};
