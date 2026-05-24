// backend/models/DeliArea.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const DeliArea = sequelize.define(
  "DeliArea",
  {
    deliAreaId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    deliCarNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "DeliArea",
    timestamps: false,
  }
);

export default DeliArea;
