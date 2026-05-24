import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const OcLink = sequelize.define(
  "OcLink",
  {
    ocLinkId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    outletId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "ocLink",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["outletId", "customerId"],
      },
    ],
  }
);

export default OcLink;
