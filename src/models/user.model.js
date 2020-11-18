const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../db/Sequelize");
const bcrypt = require("bcrypt");

// TODO: File upload with multer
const User = sequelize.define("user", {
  user_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV1,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profilePicPath: {
    type: DataTypes.STRING,
  },
  description: DataTypes.TEXT,
});

function generateHash(user) {
  if (user === null) {
    throw new Error("No found employee");
  } else if (!user.changed("password")) return user.password;
  else {
    let salt = bcrypt.genSaltSync();
    return (user.password = bcrypt.hashSync(user.password, salt));
  }
}

User.beforeCreate(generateHash);
User.beforeUpdate(generateHash);

module.exports = User;
