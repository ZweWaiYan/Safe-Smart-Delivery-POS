import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

//Connects your app to the MySQL database using Sequelize.

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT,
    logging: false
  }
);

export default sequelize;
