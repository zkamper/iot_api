const sequelize = require('../database');
const Temperature = require('./Temperature')(sequelize);
const Movement = require('./Movement')(sequelize);

module.exports = {
  sequelize,
  Temperature,
  Movement
};