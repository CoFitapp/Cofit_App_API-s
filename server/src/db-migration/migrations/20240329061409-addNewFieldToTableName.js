'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('book_events', 'ticketNumber', {
      type: Sequelize.STRING,
      allowNull: true // Modify as per your requirement
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('book_events', 'ticketNumber');
  }
};
