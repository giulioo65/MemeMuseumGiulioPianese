const { Vote, Meme } = require("../models");

async function voteMeme(req, res) {
  try {
    const { memeId } = req.params;
    const { value } = req.body;

    if (value !== 1 && value !== -1) {
      return res.status(400).json({
        message: "Vote value must be 1 or -1",
      });
    }

    const meme = await Meme.findByPk(memeId);

    if (!meme) {
      return res.status(404).json({
        message: "Meme not found",
      });
    }

    const existingVote = await Vote.findOne({
      where: {
        memeId,
        userId: req.user.id,
      },
    });

    if (existingVote) {
      if (existingVote.value === value) {
        await existingVote.destroy();

        return res.json({
          message: "Vote removed successfully",
        });
      }

      existingVote.value = value;
      await existingVote.save();

      return res.json({
        message: "Vote updated successfully",
        vote: existingVote,
      });
    }

    const vote = await Vote.create({
      value,
      memeId,
      userId: req.user.id,
    });

    return res.status(201).json({
      message: "Vote created successfully",
      vote,
    });
  } catch (error) {
    console.error("Vote meme error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function getMemeVotes(req, res) {
  try {
    const { memeId } = req.params;

    const meme = await Meme.findByPk(memeId);

    if (!meme) {
      return res.status(404).json({
        message: "Meme not found",
      });
    }

    const upvotes = await Vote.count({
      where: {
        memeId,
        value: 1,
      },
    });

    const downvotes = await Vote.count({
      where: {
        memeId,
        value: -1,
      },
    });

    return res.json({
      memeId: Number(memeId),
      upvotes,
      downvotes,
      score: upvotes - downvotes,
    });
  } catch (error) {
    console.error("Get meme votes error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

module.exports = {
  voteMeme,
  getMemeVotes,
};