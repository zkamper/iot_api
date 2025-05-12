// models/Temperature.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Temperature', {
    value: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });
};
