async function getTransformer() {
  TransformersApi = Function('return import("@xenova/transformers")')();
  const { pipeline } = await TransformersApi;

  const extractor = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2"
  );
  return extractor;
}

function getEmbedder(extractor) {
  return async (text) => {
    const output = await extractor(text, {
      pooling: "mean",
      normalize: true,
    });
    return output.data;
  };
}

function dot(vecA, vecB) {
  let sum = 0;
  for (let i = 0; i < vecA.length; i++) {
    sum += vecA[i] * vecB[i];
  }
  return sum;
}

function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must be of the same length.");
  }

  return (
    dot(vecA, vecB) / (Math.sqrt(dot(vecA, vecA)) * Math.sqrt(dot(vecB, vecB)))
  );
}

function feasibilityFilter(interests, settings) {}
function refetch(n) {}
async function getAlignedInterests(queryEmbedding, interests, getEmbedding) {
  const NEAR_INTEREST_THRESHOLD = 0.1;
  // TODO make awaits parallel
  let nearInterests = [];
  for (const interest of interests) {
    if (
      cosineSimilarity(queryEmbedding, await getEmbedding(interest)) >=
      NEAR_INTEREST_THRESHOLD
    ) {
      nearInterests.push(interest);
    }
  }
  return nearInterests;
}

module.exports = {
  getTransformer,
  getEmbedder,
  cosineSimilarity,
  feasibilityFilter,
  refetch,
  getAlignedInterests,
};
