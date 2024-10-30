"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Log extends Model {
        static associate(models) {
            Log.belongsTo(models.User, {
                foreignKey: "user",
            });
        }
    }
    Log.init(
        {
            user: DataTypes.INTEGER,
            process: DataTypes.STRING,
            itemType: DataTypes.STRING,
            itemId: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: "Log",
        }
    );
    return Log;
};
