// backend/models/TownShip.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const TownShip = sequelize.define(
  "TownShip",
  {
    townShipId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    townShipName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "TownShip",
    timestamps: false,
  }
);

export default TownShip;
