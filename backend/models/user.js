import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import bcrypt from "bcrypt";

const User = sequelize.define(
  "User",
  {
    userId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userPhone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userPassword: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userPosition: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "user",
    timestamps: false,
  }
);

// Hash password before saving
User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(10);
  user.userPassword = await bcrypt.hash(user.userPassword, salt);
});

export default User;
