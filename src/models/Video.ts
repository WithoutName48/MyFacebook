import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const Video = sequelize.define(
  'Video',
  {
    id_video: {
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
    tableName: 'Videos',
    timestamps: false,
  },
);
