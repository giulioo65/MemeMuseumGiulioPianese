const express = require("express");
const { voteMeme, getMemeVotes } = require("../controllers/meme.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// GET /api/memes/:memeId/votes
router.get("/:memeId/votes", getMemeVotes);

// POST /api/memes/:memeId/vote
router.post("/:memeId/vote", authMiddleware, voteMeme);

module.exports = router;