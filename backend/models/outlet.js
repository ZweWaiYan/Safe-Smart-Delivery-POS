import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Outlet = sequelize.define(
  "Outlet",
  {
    outletId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    outletName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    outletPhone: {
      type: DataTypes.STRING,      
      allowNull: false,
    },
    outletAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    outletType: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    marketId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    marketName: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    tableName: "outlet",
    timestamps: false,
  }
);

export default Outlet;
