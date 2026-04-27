import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const CommentReactions = sequelize.define(
  'CommentReactions',
  {
    id_comment: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    like_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    love_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    care_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    haha_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    wow_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    sad_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    angry_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: 'Comments_reactions',
    timestamps: false,
  },
);
