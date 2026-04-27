import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const Image = sequelize.define(
  'Image',
  {
    id_image: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_post: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    position: { type: DataTypes.INTEGER },
    path: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: 'Images',
    timestamps: false,
  },
);
