'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'stripeAccountId', {
      type: Sequelize.STRING, // Adjust the data type as needed
      allowNull: true, // Adjust as needed
      unique: true, // Adjust as needed
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'stripeAccountId');
  }
};
