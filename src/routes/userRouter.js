const express = require("express");
const User = require("../models/user.model");
const router = express.Router();
require("dotenv").config();

// //create user
// router.post("/add", async (req, res) => {
//   let { name, email, username, password } = req.body;
//   console.log("User info ", req.body);
//   let user;
//   try {
//     user = await User.create({
//       name,
//       email,
//       username,
//       password,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(400);
//     return res.send(err);
//   }

//   res.status(201).send({ user, msg: "User added successfully" });
// });

//update user
router.patch("/edit/:userId", async (req, res) => {
  const user_id = req.params.userId;
  const { name, description, profilePicPath } = req.body;
  try {
    const user = User.update(
      {
        name: name,
        description: description,
        profilePicPath: profilePicPath,
      },
      {
        where: { user_id: user_id },
      }
    );

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
      email: user.email,
      description: user.description,
    });
  } catch (err) {
    res.status(404).send(err);
  }
});

// login user
// router.post("/login", async function (req, res) {
//   passport.authenticate(
//     "local",
//     {
//       session: false,
//     },
//     (err, user, info) => {
//       console.log("USER: ", user, " ", err);
//       if (err || !user) {
//         return res.status(400).json({
//           error: info,
//           user: user,
//         });
//       }

//       const payload = {
//         id: user.user_id,
//       };

//       const token = jwt.sign(payload, process.env.JWT_SECRET);
//       return res.json({ user, token });
//     }
//   )(req, res);
// });

module.exports = router;
