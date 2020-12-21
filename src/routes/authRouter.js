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
      res.writable;
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

// Facebook router
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/redirect",
  passport.authenticate("facebook", {
    successRedirect: process.env.CLIENT_HOME_PAGE_URL,
    failureRedirect: process.env.LOGIN_FAIL_URL,
  })
);

// Success Auth
router.get("/login/success", (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      message: "user has successfully authenticated",
      user: req.user,
      cookies: req.cookies,
    });
  }

  res.json({
    success: false,
    message: "user has Not been authenticated",
  });
});

// When logout, redirect to client
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(process.env.CLIENT_HOME_PAGE_URL);
});

module.exports = router;
