'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('book_events', 'stripeCustomerId', {
      type: Sequelize.STRING,
      allowNull: true, // or false, depending on your requirements
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('book_events', 'stripeCustomerId');
  }
};
