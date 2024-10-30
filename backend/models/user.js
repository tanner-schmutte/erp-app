"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(models) {
            User.hasMany(models.Log, {
                foreignKey: "user",
            });
        }
    }
    User.init(
        {
            email: DataTypes.STRING,
            role: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: "User",
        }
    );
    return User;
};
