const express = require("express");
const {
  getAllMemes,
  getMemeById,
  createMeme,
  deleteMeme,
  getMemeOfTheDay,
} = require("../controllers/meme.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const router = express.Router();

// GET /api/memes
router.get("/", getAllMemes);

// GET /api/memes/today
router.get("/today", getMemeOfTheDay);

// GET /api/memes/:id
router.get("/:id", getMemeById);

// POST /api/memes
router.post("/", authMiddleware, upload.single("image"), createMeme);

// DELETE /api/memes/:id
router.delete("/:id", authMiddleware, deleteMeme);

module.exports = router;