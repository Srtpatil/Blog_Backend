const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../db/Sequelize");

const User = sequelize.define(
  "user",
  {
    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV1,
    },
    socialId: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profilePicPath: {
      type: DataTypes.STRING,
    },
    description: DataTypes.TEXT,
    isWriter: {
      type: DataTypes.INTEGER,
      defaultValue: -1,
    },
    isSuperUser: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    indexes: [
      {
        fields: ["socialId"],
        unique: true,
      },
    ],
  }
);

// Iswriter
//-1 not  a writer
// 0 applied for review
// 1 verified writer

//Add user authenticate method
// User.authenticate = async (email, password) => {
//   const user = await User.findOne({
//     where: {
//       email,
//     },
//   });

//   if (!user) {
//     throw new Error("Invalid Email or Password");
//   } else if (bcrypt.compareSync(password, user.password)) {
//     return user;
//   }
//   throw new Error("Invalid Email or Password");
// };

// function generateHash(user) {
//   if (user === null) {
//     throw new Error("No found employee");
//   } else if (!user.changed("password")) return user.password;
//   else {
//     let salt = bcrypt.genSaltSync();
//     return (user.password = bcrypt.hashSync(user.password, salt));
//   }
// }

// User.beforeCreate(generateHash);
// User.beforeUpdate(generateHash);

module.exports = User;
