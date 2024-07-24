/**
 * @param {float[]} optionScores A 2d array of [interest, preference, transit] scores
 *  in the order given by the recommendation system
 * @param {int} likedOptionIndex The index of the item which the user liked
 * @param {float[]} currentWeights An array consisting of the [interest weight, preference weight, transit weight]
 *  used to generate the recommendations associated with optionScores
 * @returns A float array that represents the adjusted values of weights
 */
function weightLearning(optionScores, likedOptionIndex, currentWeights) {
  let adjustment = [0, 0, 0];
  if (likedOptionIndex >= optionScores.length) return adjustment;

  const likeError = calculateError(optionScores, likedOptionIndex);
  adjustment = adjustment.map((val, i) => val + likeError[i]);

  return adjustment.map((val, i) => val + currentWeights[i]);
}

function calculateError(optionScores, likedOptionIndex) {
  const error = [0, 0, 0];
  const likedOption = optionScores[likedOptionIndex];
  optionScores.forEach((option, rank) => {
    option.forEach((score, scoreTypeIdx) => {
      const likedScoreDiff = likedOption[scoreTypeIdx] - score;
      // focus on items that are out of the expected order
      if (
        (likedScoreDiff > 0 && likedOptionIndex > rank) ||
        (likedScoreDiff < 0 && likedOptionIndex < rank)
      ) {
        // squared error of score, weighted by difference in rank
        error[scoreTypeIdx] += (likedOptionIndex - rank) * likedScoreDiff ** 2;
      }
    });
  });
  return error;
}
