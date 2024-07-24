const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const places = await prisma.likedPlace.findMany();
  res.status(200).json(places);
});

router.get("/:id/", async (req, res) => {
  const numLikes = await prisma.likedPlace.findUnique({
    where: {
      id: req.params.id,
    },
    select: {
      _count: {
        select: { users: true },
      },
    },
  });
  res.status(200).json(numLikes);
});

module.exports = { router };
