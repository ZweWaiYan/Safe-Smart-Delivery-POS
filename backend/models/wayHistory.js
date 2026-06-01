import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import TownShip from "./township.js";

const WayHistory = sequelize.define(
  "WayHistory",
  {
    wayHistoryId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    wayId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "wayId",
    },
    historyData: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    tableName: "wayHistory",
    timestamps: false,
  },
);

export default WayHistory;
