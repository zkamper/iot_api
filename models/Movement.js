const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Movement', {
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    duration: {
      type: DataTypes.FLOAT, // seconds (or change to INTEGER if always whole numbers)
      allowNull: false,
    }
  });
};