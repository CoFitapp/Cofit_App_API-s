// Migration file (create_payment_intents_table.js)
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment_intents', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      amount: {
        type: Sequelize.INTEGER
      },
      currency: {
        type: Sequelize.STRING
      },
      payment_method: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      client_secret: {
        type: Sequelize.STRING
      },
     createdAt: {
            allowNull: false,
            type: Sequelize.DATE
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
          }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payment_intents');
  }
};
