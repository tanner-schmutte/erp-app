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
            companyID: DataTypes.INTEGER,
            itemType: DataTypes.STRING,
            itemId: DataTypes.INTEGER,
            status: DataTypes.STRING,
            error: DataTypes.STRING,
        },
        {
            sequelize,
            modelName: "Log",
        }
    );
    return Log;
};
