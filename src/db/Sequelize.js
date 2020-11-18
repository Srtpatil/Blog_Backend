const dbConfig = require("../config/db.config");
const { Sequelize } = require("sequelize");

//connecting to database
const sequelize = new Sequelize("testdb", "samarth", "samarth@mysql", {
  host: "localhost",
  dialect: "mysql",
});

//test connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.log("Error ", err);
  });
