import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const UserPersonalData = sequelize.define(
  'UserPersonalData',
  {
    id_user: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    surname: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date_of_birth: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    current_place: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    hometown: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    relationship_status: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    education: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    work: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'Users_Personal_Data',
    timestamps: false,
  },
);
