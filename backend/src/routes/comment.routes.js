const express = require("express");
const {
  getCommentsByMeme,
  createComment,
  deleteComment,
} = require("../controllers/comment.controller");

const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

// GET /api/memes/:memeId/comments
router.get("/:memeId/comments", authMiddleware, getCommentsByMeme);

// POST /api/memes/:memeId/comments
router.post("/:memeId/comments", authMiddleware, createComment);

// DELETE /api/memes/comments/:id
router.delete("/comments/:id", authMiddleware, deleteComment);

module.exports = router;