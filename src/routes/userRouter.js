const express = require("express");
const User = require("../models/user.model");
const router = express.Router();

//create user
router.post("/add", async (req, res) => {
  let { name, email, username, password, description } = req.body;

  const user = await User.create({
    name,
    email,
    username,
    password,
    description,
  }).catch((err) => {
    res.status(400);
    return res.send(err);
  });

  res.status(201).send({ user, msg: "User added successfully" });
});

//update user
router.patch("/edit/:userId", async (req, res) => {
  const user_id = req.params.userId;
  const { name, username, description } = req.body;
  try {
    const user = User.update( {
        name: name,
        username: username,
        description: description,
      },{
      where: { user_id: user_id },
    });

    if (!user) {
      return res.status(404).send({
        msg: "User not found",
      });
    }


    return res.status(200).send({
        user,
        msg: "User Updated Successfully",
      });
  } catch (err) {
    res.status(400).send(err);
  }
});

// get user profile
router.get("/me/:userId", async (req, res) => {
  const user_id = req.params.userId;
  try {
    const user = await User.findOne({
      where: {
        user_id: user_id,
      },
    });

    return res.status(200).send({
      name: user.name,
      username: user.username,
      email: user.email,
      description: user.description,
    });
  } catch (err) {
    res.status(404).send(err);
  }
});
