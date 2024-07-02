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
  // for use in conjunction with login page
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

router.put("/:id/hobby", async (req, res) => {
  const user = await prisma.user.update({
    where: {
      id: req.params.id,
    },
    data: {
      hobbies: {
        push: req.body.hobby,
      },
    },
  });
  res.status(204).json(user);
});

router.put("/:id/cuisine", async (req, res) => {
  const user = await prisma.user.update({
    where: {
      id: req.params.id,
    },
    data: {
      cuisines: {
        push: req.body.cuisine,
      },
    },
  });
  res.status(204).json(user);
});

module.exports = { router, getUser };
