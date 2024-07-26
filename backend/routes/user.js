const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { calculateNewWeights } = require("../WeightLearning");

router.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.status(200).json(users);
});

async function getUser(id) {
  // get a single user without creating a new profile
  // for use internally within backend
  const user = await prisma.user.findUnique({
    where: { id: id },
    include: { likedPlaces: true },
  });
  return user;
}

router.get("/:id", async (req, res) => {
  // creates a user with given id if not found, otherwise gets user
  const user = await prisma.user.upsert({
    where: { id: req.params.id },
    update: {},
    create: { id: req.params.id },
    include: { likedPlaces: true },
  });
  res.status(200).json(user);
});

router.post("/:id", async (req, res) => {
  const newUser = await prisma.user.create({
    data: {
      id: req.params.id,
    },
  });
  res.status(201).json(newUser);
});

router.delete("/:id", async (req, res) => {
  const deletedUser = await prisma.user.delete({
    where: { id: req.params.id },
  });
  res.status(204).json(deletedUser);
});

router.get("/:id/interests", async (req, res) => {
  const interests = await prisma.user.findUnique({
    where: {
      id: req.params.id,
    },
    select: {
      interests: true,
    },
  });
  res.status(200).json(interests);
});

// Edit a user's interests
router.put("/:id/interests", async (req, res) => {
  const interests = await prisma.user.update({
    where: {
      id: req.params.id,
    },
    data: {
      interests: req.body.interests,
    },
  });
  res.status(204).json(interests);
});

router.get("/:id/likes", async (req, res) => {
  const likedPlaces = await prisma.user.findMany({
    where: {
      id: req.params.id,
    },
    select: {
      likedPlaces: true,
    },
  });
  res.status(200).json(likedPlaces);
});

router.put("/:id/likeAndUpdateWeights", async (req, res) => {
  const { id } = req.params;
  const { placeId, options, isUnlike } = req.body;

  // add liked place to user profile
  if (isUnlike) {
    await removeLikedPlace(id, placeId);
  } else {
    await addLikedPlace(id, placeId);
  }

  // learn what the new weights should be and update profile
  const { weightInterest, weightPreference, weightTransit } = await getWeights(
    id
  );
  await setWeights(
    id,
    calculateNewWeights(
      options.map((option) => option.scores),
      options.map((option) => option.place.id).indexOf(placeId),
      {
        interest: weightInterest,
        preference: weightPreference,
        transit: weightTransit,
      },
      isUnlike
    )
  );
  res.status(200).end();
});

async function getWeights(id) {
  return await prisma.user.findUnique({
    where: {
      id: id,
    },
    select: {
      weightInterest: true,
      weightPreference: true,
      weightTransit: true,
    },
  });
}

async function setWeights(id, newWeights) {
  await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      weightInterest: newWeights.interest,
      weightPreference: newWeights.preference,
      weightTransit: newWeights.transit,
    },
  });
}

async function addLikedPlace(id, placeId) {
  await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      likedPlaces: {
        connectOrCreate: {
          where: {
            id: placeId,
          },
          create: {
            id: placeId,
          },
        },
      },
    },
  });
}

async function removeLikedPlace(id, placeId) {
  await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      likedPlaces: {
        disconnect: {
          id: placeId,
        },
      },
    },
  });
}

module.exports = { router, getUser };
