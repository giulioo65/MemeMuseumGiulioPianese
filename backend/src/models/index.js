const sequelize = require("../config/database");

const User = require("./User");
const Meme = require("./Meme");
const Comment = require("./Comment");
const Vote = require("./Vote");
const Tag = require("./Tag");
const MemeTag = require("./MemeTag");

User.hasMany(Meme, {
  foreignKey: {
    name: "userId",
    allowNull: false,
  },
  onDelete: "CASCADE",
});

Meme.belongsTo(User, {
  foreignKey: {
    name: "userId",
    allowNull: false,
  },
});

User.hasMany(Comment, {
  foreignKey: {
    name: "userId",
    allowNull: false,
  },
  onDelete: "CASCADE",
});

Comment.belongsTo(User, {
  foreignKey: {
    name: "userId",
    allowNull: false,
  },
});

Meme.hasMany(Comment, {
  foreignKey: {
    name: "memeId",
    allowNull: false,
  },
  onDelete: "CASCADE",
});

Comment.belongsTo(Meme, {
  foreignKey: {
    name: "memeId",
    allowNull: false,
  },
});

User.hasMany(Vote, {
  foreignKey: {
    name: "userId",
    allowNull: false,
  },
  onDelete: "CASCADE",
});

Vote.belongsTo(User, {
  foreignKey: {
    name: "userId",
    allowNull: false,
  },
});

Meme.hasMany(Vote, {
  foreignKey: {
    name: "memeId",
    allowNull: false,
  },
  onDelete: "CASCADE",
});

Vote.belongsTo(Meme, {
  foreignKey: {
    name: "memeId",
    allowNull: false,
  },
});

/*
  Relazione molti-a-molti:
  un meme può avere più tag
  un tag può appartenere a più meme
*/
Meme.belongsToMany(Tag, {
  through: MemeTag,
  foreignKey: "memeId",
  otherKey: "tagId",
  onDelete: "CASCADE",
});

Tag.belongsToMany(Meme, {
  through: MemeTag,
  foreignKey: "tagId",
  otherKey: "memeId",
  onDelete: "CASCADE",
});

module.exports = {
  sequelize,
  User,
  Meme,
  Comment,
  Vote,
  Tag,
  MemeTag,
};