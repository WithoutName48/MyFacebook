import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const Comment = sequelize.define(
  'Comment',
  {
    id_comment: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_post: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    id_comment_replied_to: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    date_created: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: 'Comments',
    timestamps: false,
  },
);
