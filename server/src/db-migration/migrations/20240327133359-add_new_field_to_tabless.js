'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('book_events', 'transactionId', {
      type: Sequelize.STRING,
      allowNull: true, // or false, depending on your requirements
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('book_events', 'transactionId');
  }
};
