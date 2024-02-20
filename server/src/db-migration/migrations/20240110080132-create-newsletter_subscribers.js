'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("newsletter_subscribers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      email: Sequelize.STRING,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("newsletter_subscribers");
  }
};
