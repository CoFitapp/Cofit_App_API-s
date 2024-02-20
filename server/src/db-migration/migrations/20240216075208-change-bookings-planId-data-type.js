"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        // Alter the data type of the planId column to STRING
        await queryInterface.changeColumn("book_events", "planId", {
            type: Sequelize.STRING,
            allowNull: false
        });
    },

    async down(queryInterface, Sequelize) {
        // Revert the data type back to INTEGER in case of rollback
        await queryInterface.changeColumn("book_events", "planId", {
            type: Sequelize.INTEGER,
            allowNull: false
        });
    }
};
