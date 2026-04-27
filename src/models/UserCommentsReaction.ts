import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const UserCommentsReaction =
  sequelize.define(
    'UserCommentsReaction',
    {
      id_user: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      id_comment: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },

      like: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      love: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      care: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      haha: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      wow: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      sad: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      angry: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: 'Users_comments_reaction',
      timestamps: false,
    },
  );
