'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("news_articles", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: Sequelize.INTEGER,
      title: Sequelize.STRING,
      description: Sequelize.STRING,
      image: {
        type: Sequelize.STRING,
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("news_articles");
  }
};
