'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addColumn(
      'users', // table name
      'first_name', // new field name
      {
        type: Sequelize.STRING,
      },
    ),  
    queryInterface.addColumn(
      'users', // table name
      'last_name', // new field name
      {
        type: Sequelize.STRING,
      },
    )
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};

// npx sequelize db:migrate --name 20240129124321-modify_users_add_new_fields.js



