import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import TownShip from "./township.js";

const Way = sequelize.define(
  "WayList",
  {
    wayId: {
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
    itemPrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deliFee: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    itemQty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    wayType: {
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
    },
    pickupDeliCar: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    senderDeliCar: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    city: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    remark: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    complaint: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    townShipId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    wayDate: {
      type: DataTypes.STRING ,
      allowNull: false,
    },  
    updatedDate : {
      type: DataTypes.STRING,
      allowNull: true,
    }
  },
  {
    tableName: "way",
    timestamps: false,
  }
);

export default Way;
