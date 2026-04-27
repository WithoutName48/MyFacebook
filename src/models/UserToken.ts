import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const UserToken = sequelize.define(
  'UserToken',
  {
    id_token: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: 'Users_tokens',
    timestamps: false,
  },
);
