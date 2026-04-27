import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const Post = sequelize.define(
  'Post',
  {
    id_post: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date_created: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    content: { type: DataTypes.TEXT },
  },
  {
    tableName: 'Posts',
    timestamps: false,
  },
);
