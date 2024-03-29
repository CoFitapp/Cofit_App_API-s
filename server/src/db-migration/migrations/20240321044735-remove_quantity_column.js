'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove the 'quantity' column from the 'book_events' table
    await queryInterface.removeColumn('book_events', 'quantity');
  },

  down: async (queryInterface, Sequelize) => {
    // If you need to rollback, you can add back the 'quantity' column
    await queryInterface.addColumn('book_events', 'quantity', {
      type: Sequelize.INTEGER // Adjust the data type if needed
    });
  }
};
