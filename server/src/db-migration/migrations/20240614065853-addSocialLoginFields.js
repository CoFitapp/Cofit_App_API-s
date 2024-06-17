'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('newUsers', 'googleuser', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn('newUsers', 'facebookuser', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });

    await queryInterface.addColumn('newUsers', 'appleuser', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('newUsers', 'googleuser');
    await queryInterface.removeColumn('newUsers', 'facebookuser');
    await queryInterface.removeColumn('newUsers', 'appleuser');
  }
};
