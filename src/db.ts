import { Sequelize } from 'sequelize';
import 'dotenv/config';

const isTest = process.env.NODE_ENV === 'test';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: isTest
    ? ':memory:' // ":memory:" create a temporary database that lives only in RAM
    : './data/database.sqlite',
  logging: false,
});
