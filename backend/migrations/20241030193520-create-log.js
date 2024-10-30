"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Logs", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            user: {
                allowNull: false,
                references: { model: "Users" },
                type: Sequelize.INTEGER,
            },
            process: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            companyId: {
                type: Sequelize.INTEGER,
            },
            itemType: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            itemId: {
                allowNull: false,
                type: Sequelize.INTEGER,
            },
            status: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            error: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW,
            },
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("Logs");
    },
};
