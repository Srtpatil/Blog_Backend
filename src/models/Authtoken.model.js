const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../db/Sequelize");

const AuthToken = sequelize.define('AuthToken', {
    token: DataTypes.STRING
});

module.exports = AuthToken