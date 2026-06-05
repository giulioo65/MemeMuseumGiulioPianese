const { Meme, User, Vote, Tag } = require("../models");
const path = require("path");
const fs = require("fs");

function buildMemeInclude(tagName, authorName) {
  const { Op } = require("sequelize");

  const include = [
    {
      model: User,
      attributes: ["id", "username", "email"],
    },
    {
      model: Tag,
      attributes: ["id", "name"],
      through: {
        attributes: [],
      },
    },
  ];

  if (authorName) {
    include[0].where = {
      username: {
        [Op.like]: `%${authorName}%`,
      },
    };
    include[0].required = true;
  }

  if (tagName) {
    include[1].where = {
      name: tagName,
    };
    include[1].required = true;
  }

  return include;
}

const memeInclude = buildMemeInclude();

async function getAllMemes(req, res) {
  try {
    const {
      tag,
      author,
      userId,
      dateFrom,
      dateTo,
      sort,
      page = 1,
    } = req.query;

    const { Op } = require("sequelize");

    const limit = 10;
    const currentPage = Number(page) > 0 ? Number(page) : 1;
    const offset = (currentPage - 1) * limit;

    const where = {};

    if (userId) {
      where.userId = userId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};

      if (dateFrom) {
        where.createdAt[Op.gte] = new Date(dateFrom);
      }

      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt[Op.lte] = endDate;
      }
    }

    const allMemes = await Meme.findAll({
      where,
      include: buildMemeInclude(tag, author),
      order: [["createdAt", "DESC"]],
    });

    const memesWithVotes = await Promise.all(
      allMemes.map(async (meme) => {
        const plainMeme = meme.toJSON();

        const allVotes = await Vote.findAll({
          where: { memeId: plainMeme.id },
        });

        const upvotes = allVotes.filter((vote) => vote.value === 1).length;
        const downvotes = allVotes.filter((vote) => vote.value === -1).length;

        return {
          ...plainMeme,
          upvotes,
          downvotes,
          score: upvotes - downvotes,
        };
      })
    );

    if (sort === "titleAsc") {
      memesWithVotes.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (sort === "titleDesc") {
      memesWithVotes.sort((a, b) => b.title.localeCompare(a.title));
    }

    if (sort === "newest") {
      memesWithVotes.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }

    if (sort === "oldest") {
      memesWithVotes.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    }

    if (sort === "upvotes") {
      memesWithVotes.sort((a, b) => b.upvotes - a.upvotes);
    }

    if (sort === "downvotes") {
      memesWithVotes.sort((a, b) => b.downvotes - a.downvotes);
    }

    const totalItems = memesWithVotes.length;
    const totalPages = Math.ceil(totalItems / limit);

    const paginatedMemes = memesWithVotes.slice(offset, offset + limit);

    return res.json({
      memes: paginatedMemes,
      currentPage,
      totalPages,
      totalItems,
      limit,
    });
  } catch (error) {
    console.error("Get all memes error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getMemeById(req, res) {
  try {
    const { id } = req.params;

    const meme = await Meme.findByPk(id, {
      include: memeInclude,
    });

    if (!meme) {
      return res.status(404).json({ message: "Meme not found" });
    }

    return res.json(meme);
  } catch (error) {
    console.error("Get meme by id error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function createMeme(req, res) {
  try {
    const { title, description } = req.body;
    let { imageUrl, tags } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    if (req.file) {
      imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    if (!imageUrl) {
      return res.status(400).json({
        message: "Image file or imageUrl is required",
      });
    }

    const meme = await Meme.create({
      title,
      description,
      imageUrl,
      userId: req.user.id,
    });

    let cleanTagNames = [];

    if (Array.isArray(tags)) {
      cleanTagNames = tags;
    } else if (typeof tags === "string") {
      cleanTagNames = tags.split(",");
    }

    cleanTagNames = [
      ...new Set(
        cleanTagNames
          .map((tag) => String(tag).trim())
          .filter((tag) => tag.length > 0)
      ),
    ];

    if (cleanTagNames.length > 0) {
      const tagInstances = await Promise.all(
        cleanTagNames.map(async (tagName) => {
          const [tag] = await Tag.findOrCreate({
            where: { name: tagName },
            defaults: { name: tagName },
          });

          return tag;
        })
      );

      await meme.setTags(tagInstances);
    }

    const createdMeme = await Meme.findByPk(meme.id, {
      include: memeInclude,
    });

    return res.status(201).json({
      message: "Meme created successfully",
      meme: createdMeme,
    });
  } catch (error) {
    console.error("Create meme error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getMemeVotes(req, res) {
  try {
    const memeId = req.params.memeId || req.params.id;

    const meme = await Meme.findByPk(memeId);

    if (!meme) {
      return res.status(404).json({ message: "Meme not found" });
    }

    const allVotes = await Vote.findAll({
      where: { memeId },
    });

    const upvotes = allVotes.filter((vote) => vote.value === 1).length;
    const downvotes = allVotes.filter((vote) => vote.value === -1).length;
    const score = upvotes - downvotes;

    return res.json({
      upvotes,
      downvotes,
      score,
      userVote: 0,
    });
  } catch (error) {
    console.error("Get meme votes error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function voteMeme(req, res) {
  try {
    const memeId = req.params.memeId || req.params.id;
    const { value } = req.body;

    if (![1, -1].includes(value)) {
      return res.status(400).json({
        message: "Vote value must be 1 or -1",
      });
    }

    const meme = await Meme.findByPk(memeId);

    if (!meme) {
      return res.status(404).json({ message: "Meme not found" });
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
      } else {
        existingVote.value = value;
        await existingVote.save();
      }
    } else {
      await Vote.create({
        value,
        memeId,
        userId: req.user.id,
      });
    }

    const allVotes = await Vote.findAll({
      where: { memeId },
    });

    const upvotes = allVotes.filter((vote) => vote.value === 1).length;
    const downvotes = allVotes.filter((vote) => vote.value === -1).length;
    const score = upvotes - downvotes;

    const myVote = allVotes.find((vote) => vote.userId === req.user.id);
    const userVote = myVote ? myVote.value : 0;

    return res.json({
      upvotes,
      downvotes,
      score,
      userVote,
    });
  } catch (error) {
    console.error("Vote meme error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function deleteMeme(req, res) {
  try {
    const { id } = req.params;

    const meme = await Meme.findByPk(id);

    if (!meme) {
      return res.status(404).json({
        message: "Meme not found",
      });
    }

    if (meme.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "You are not allowed to delete this meme",
      });
    }

    const imageUrl = meme.imageUrl || "";

    if (imageUrl.includes("/uploads/")) {
      const fileName = imageUrl.split("/uploads/").pop();
      const safeFileName = path.basename(fileName);
      const filePath = path.join(__dirname, "../../uploads", safeFileName);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await meme.destroy();

    return res.json({
      message: "Meme deleted successfully",
    });
  } catch (error) {
    console.error("Delete meme error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function getMemeOfTheDay(req, res) {
  try {
    // 1) Prendi tutti i meme
    const allMemes = await Meme.findAll({ include: memeInclude });

    if (allMemes.length === 0) {
      return res.status(404).json({ message: "Nessun meme disponibile" });
    }

    // 2) Calcola i punteggi
    const memesWithScore = await Promise.all(
      allMemes.map(async (meme) => {
        const votes = await Vote.findAll({ where: { memeId: meme.id } });
        const upvotes = votes.filter((v) => v.value === 1).length;
        const downvotes = votes.filter((v) => v.value === -1).length;
        return {
          ...meme.toJSON(),
          score: upvotes - downvotes,
        };
      })
    );

    // 3) Ordina per punteggio decrescente e prendi la Top 20
    memesWithScore.sort((a, b) => b.score - a.score);
    const top20 = memesWithScore.slice(0, 20);

    // 4) Ordina la Top 20 per ID per garantire che l'array sia "stabile"
    // (altrimenti cambiamenti di score rimescolano l'ordine e rovinano il generatore)
    top20.sort((a, b) => a.id - b.id);

    // 5) Generatore pseudo-casuale per "pescare" un meme in base alla data
    function seededRandom(seed) {
      let s = seed;
      return function () {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0xffffffff;
      };
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayNumber = Math.floor(todayStart.getTime() / (1000 * 60 * 60 * 24));

    // Estraiamo il meme "virtuale" di ieri e quello di oggi
    const randYesterday = seededRandom(dayNumber - 1);
    const randToday = seededRandom(dayNumber);

    const offsetYesterday = Math.floor(randYesterday() * top20.length);
    const offsetToday = Math.floor(randToday() * top20.length);

    let finalOffset = offsetToday;

    // 6) Antirimbalzo: se oggi pesco lo stesso ID di ieri, prendo il successivo
    if (top20[offsetToday].id === top20[offsetYesterday].id) {
      finalOffset = (offsetToday + 1) % top20.length;
    }

    return res.json(top20[finalOffset]);
  } catch (error) {
    console.error("Get meme of the day error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}



module.exports = {
  getAllMemes,
  getMemeById,
  createMeme,
  getMemeVotes,
  voteMeme,
  deleteMeme,
  getMemeOfTheDay,
};