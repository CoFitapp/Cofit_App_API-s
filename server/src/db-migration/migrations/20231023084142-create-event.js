"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("events", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            city_id: Sequelize.INTEGER,
            events: Sequelize.JSON,
            link: Sequelize.STRING,
            user_id: Sequelize.INTEGER,
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("events");
    },
};