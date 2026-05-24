// backend/models/DeliAreaTownShip.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DeliAreaTownShip = sequelize.define(
  "DeliAreaTownShip",
  {
    deliAreaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    townShipId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "DeliAreaTownShip",
    timestamps: false,
  }
);

export default DeliAreaTownShip;
