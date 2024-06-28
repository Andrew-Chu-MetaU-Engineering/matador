const express = require("express");
const router = express.Router();

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.status(200).json(users);
});

router.get("/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
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

module.exports = router;
