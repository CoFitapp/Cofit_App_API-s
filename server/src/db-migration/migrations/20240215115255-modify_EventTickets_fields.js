module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add a new field to the existing table
    await queryInterface.addColumn('EventTickets', 'total_number', {
      type: Sequelize.STRING,
      allowNull: true, // Modify this as per your requirement
      defaultValue: null // Modify this as per your requirement
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove the added field if migration is reverted
    await queryInterface.removeColumn('EventTickets', 'total_number');
  }
};