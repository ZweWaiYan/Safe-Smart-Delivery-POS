import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Route = sequelize.define(
  "Route",
  {
    routeId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pageRoute: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    canView: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    canAdd: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    canEdit: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    canDelete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    tableName: "route",
    timestamps: false,
  }
);

export default Route;
