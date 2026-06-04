const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const memeRoutes = require("./routes/meme.routes");
const commentRoutes = require("./routes/comment.routes");
const voteRoutes = require("./routes/vote.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req, res) => {
  res.json({ message: "MemeMuseum API is running" });
});

// Auth
app.use("/api/auth", authRoutes);

// Meme
app.use("/api/memes", memeRoutes);

// Commenti
app.use("/api/memes", commentRoutes);

// Voti
app.use("/api/memes", voteRoutes);

module.exports = app;