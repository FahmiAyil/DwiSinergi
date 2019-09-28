'use strict';
module.exports = (sequelize, DataTypes) => {
  const transaction = sequelize.define('transaction', {
    nominal: DataTypes.BIGINT,
    category_id: DataTypes.INTEGER,
    description: DataTypes.STRING
  }, {});
  transaction.associate = function(models) {
    transaction.belongsTo(models.category, { foreignKey: 'category_id' });
  };
  return transaction;
};