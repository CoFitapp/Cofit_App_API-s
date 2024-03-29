'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('book_events', 'quantity', {
      type: Sequelize.INTEGER, // Adjust the data type as needed
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('book_events', 'quantity');
  }
};
