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

  // TODO handle isUnlike condition completely

  const likeError = calculateError(optionScores, likedOptionIndex, isUnlike);
  return calculateAdjustedWeights(likeError, currentWeights);
}

function calculateError(optionScores, likedOptionIndex, isUnlike) {
  const error = [0, 0, 0];
  const likedOption = optionScores[likedOptionIndex];
  optionScores.forEach((option, rank) => {
    option.forEach((score, scoreTypeIdx) => {
      const likedScoreDiff = likedOption[scoreTypeIdx] - score;
      // focus on items that are out of the expected order
      if (
        isUnlike !== // "out-of-order" condition inverts when isUnlike
        ((likedScoreDiff > 0 && likedOptionIndex > rank) ||
          (likedScoreDiff < 0 && likedOptionIndex < rank))
      ) {
        // squared error of score, weighted by difference in rank
        error[scoreTypeIdx] += (likedOptionIndex - rank) * likedScoreDiff ** 2;
      }
    });
  });
  return error;
}

// Make sure that any additions/subtractions to the weights are balanced
function calculateAdjustedWeights(adjustment, weights) {
  const numUnadjusted = adjustment.filter((val) => val === 0);
  if (numUnadjusted > 0) {
    // if some weights' adjustment is 0, evenly split -(total adjustments) between these unadjusted weights
    const totalAdjustment = adjustment.reduce((sum, val) => sum + val);
    return adjustment.map(
      (val, i) =>
        (val === 0 ? -totalAdjustment / numUnadjusted : val) + weights[i]
    );
  } else {
    // if all weights are adjusted, take the difference from the avg adjustment
    const averageAdjustment =
      adjustment.reduce((sum, val) => sum + val) / adjustment.length;
    return adjustment.map((val, i) => val - averageAdjustment + weights[i]);
  }
}

module.exports = {
  calculateNewWeights,
};
