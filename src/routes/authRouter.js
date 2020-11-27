const express = require("express");
const User = require("../models/user.model");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");
const url = require("url");

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/redirect",
  passport.authenticate("google", {
    session: false,
    // successRedirect: "http://localhost:8887/",
    // failureRedirect: "http://localhost:8081/google/login/failed",
  }),
  (req, res) => {
    if (req.user) {
      const token = jwt.sign(req.user.user_id, process.env.JWT_SECRET);
      let pathname = url.parse(req.url).pathname;
      res.writable
      return res.json({ user: req.user, token });
    }
  }
);

router.get("/google/login/success", (req, res) => {
  console.log("Success: ", req);

  if (req.user) {
    return res.json({
      success: true,
      message: "User has successfully authenicated",
      user: req.user,
    });
  }
  return res.status(401).json({
    success: false,
    message: "user failed to authenticate.",
  });
});

router.get("/google/login/failed", (req, res) => {
  res.status(401).json({
    success: false,
    message: "user failed to authenticate.",
  });
});

module.exports = router;
