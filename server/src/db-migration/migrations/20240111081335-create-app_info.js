'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("app_info", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      about: Sequelize.TEXT('long'),
      terms: Sequelize.TEXT('long'),
      cookies: Sequelize.TEXT('long'),
      privacy: Sequelize.TEXT('long'),
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("app_info");
  }
};