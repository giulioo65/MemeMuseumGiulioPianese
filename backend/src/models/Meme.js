const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Meme = sequelize.define(
  "Meme",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "memes",
    timestamps: true,
  }
);

module.exports = Meme;