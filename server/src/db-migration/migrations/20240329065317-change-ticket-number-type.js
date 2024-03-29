'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Change the data type of the ticketNumber column
    await queryInterface.changeColumn('book_events', 'ticketNumber', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true // Modify as per your requirement
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the data type change
    await queryInterface.changeColumn('book_events', 'ticketNumber', {
      type: Sequelize.STRING, // Change back to the original data type
      allowNull: true // Modify as per your requirement
    });
  }
};
