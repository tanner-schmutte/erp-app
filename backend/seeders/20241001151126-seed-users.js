"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert(
            "Users",
            [
                {
                    email: "tanner.schmutte@procore.com",
                    role: "admin",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    email: "full.access@procore.com",
                    role: "full",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    email: "limited.access@procore.com",
                    role: "limited",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
            {}
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("Users", null, {});
    },
};
