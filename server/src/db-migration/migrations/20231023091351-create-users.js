"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("users", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            google_id: Sequelize.STRING,
            full_name: Sequelize.STRING,
            email: {
                unique: true,
                type: Sequelize.STRING,
            },
            phone_no: Sequelize.STRING,
            profile_image: {
                type: Sequelize.STRING,
            },
            location: {
                type: Sequelize.STRING,
            },
            created_at: Sequelize.DATE,
            updated_at: Sequelize.DATE,
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("users");
    },
};