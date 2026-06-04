const { Comment, Meme, User } = require("../models");

// Ottieni tutti i commenti di un meme
async function getCommentsByMeme(req, res) {
  try {
    const { memeId } = req.params;

    const meme = await Meme.findByPk(memeId);
    if (!meme) return res.status(404).json({ message: "Meme not found" });

    const comments = await Comment.findAll({
      where: { memeId },
      include: [{ model: User, attributes: ["id", "username", "email"] }],
      order: [["createdAt", "ASC"]],
    });

    return res.json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Crea un commento
async function createComment(req, res) {
  try {
    const { memeId } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const meme = await Meme.findByPk(memeId);
    if (!meme) return res.status(404).json({ message: "Meme not found" });

    const comment = await Comment.create({
      text,
      memeId,
      userId: req.user.id,
    });

    return res.status(201).json({ message: "Comment created successfully", comment });
  } catch (error) {
    console.error("Create comment error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Cancella commento
async function deleteComment(req, res) {
  try {
    const { id } = req.params;

    const comment = await Comment.findByPk(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "You are not allowed to delete this comment" });
    }

    await comment.destroy();
    return res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  getCommentsByMeme,
  createComment,
  deleteComment,
};