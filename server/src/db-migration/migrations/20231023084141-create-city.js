"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("cities", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            city: Sequelize.STRING,
            offset: Sequelize.INTEGER,
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("cities");
    },
};