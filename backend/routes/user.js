const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.status(200).json(users);
});

async function getUser(id) {
  // get a single user without creating a new profile
  // for use internally within backend
  const user = await prisma.user.findUnique({
    where: { id: id },
  });
  return user;
}

router.get("/:id", async (req, res) => {
  // creates a user with given id if not found, otherwise gets user
  const user = await prisma.user.upsert({
    where: { id: req.params.id },
    update: {},
    create: { id: req.params.id },
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
  const user = await prisma.user.update({
    where: {
      id: req.params.id,
    },
    data: {
      interests: req.body.interests,
    },
  });
  res.status(204).json(user);
});

module.exports = { router, getUser };
