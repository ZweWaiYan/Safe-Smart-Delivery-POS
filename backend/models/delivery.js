import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Delivery = sequelize.define(
  "Delivery",
  {
    deliveryId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    deliveryName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deliveryPhone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deliveryStatus: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deliveryCar: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "delivery",
    timestamps: false,
  }
);

export default Delivery;
