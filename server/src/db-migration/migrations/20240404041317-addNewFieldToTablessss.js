'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('transactions', 'type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'payment' // Assuming 'payment' is the default value
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('transactions', 'type');
  }
};

