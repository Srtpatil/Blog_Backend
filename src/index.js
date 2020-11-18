const express = require("express");
const sequelize = require("./db/Sequelize");
const User = require("./models/user");
const app = express();

app.get("/", (req, res) => {
  res.send({
    msg: "Hello World!",
  });
});

const port = process.env.PORT || 8081;
sequelize
  .sync()
  .then(() => {
    console.log("Connected to Database Successfully.");
    app.listen(port, () => {
      console.log("Application Server is up on port ", port);
    });
  })
  .then(() => {
    // Insert data
    return User.create({
      name: "Kunal Ambekar",
      email: "example@mail.com",
      username: "Kunal04",
      password: "test12345",
      description: "This is bio",
    });
  })
  .catch((err) => console.log("Unable to Connect ", err));
