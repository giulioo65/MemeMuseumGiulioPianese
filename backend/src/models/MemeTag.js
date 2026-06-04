const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MemeTag = sequelize.define(
  "MemeTag",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
  },
  {
    tableName: "meme_tags",
    timestamps: false,
  }
);

module.exports = MemeTag;