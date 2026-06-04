// backend/src/models/Vote.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Vote = sequelize.define(
  "Vote",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { isIn: [[1, -1]] },
    },
  },
  {
    tableName: "votes",
    timestamps: true,
  }
);

module.exports = Vote;