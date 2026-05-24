// backend/models/Market.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Market = sequelize.define("Market", {
  marketId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  marketName: {
    type: DataTypes.STRING,
    allowNull: false,
  },  
}, {
  tableName: "market",
  timestamps: false,
});

export default Market;
