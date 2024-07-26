const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const places = await prisma.likedPlace.findMany();
  res.status(200).json(places);
});

async function getPlaceLikes(placeId) {
  const likedPlaces = await prisma.likedPlace.findUnique({
    where: {
      id: placeId,
    },
    select: {
      users: {
        select: {
          id: true,
          interests: true,
          likedPlaces: true,
        },
      },
    },
  });
  return likedPlaces;
}

module.exports = { router, getPlaceLikes };
