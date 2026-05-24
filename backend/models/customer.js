import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Customer = sequelize.define(
  "Customer",
  {
    customerId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    }, 
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerPhone: {
      type: DataTypes.STRING,      
      allowNull: false,
    },   
    customerAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },    
  },
  {
    tableName: "customer",
    timestamps: false,    
  }
);

export default Customer;
