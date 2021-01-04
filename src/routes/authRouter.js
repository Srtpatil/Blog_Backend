const express = require("express");
const router = express.Router();
const passport = require("passport");

// Google router
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/redirect",
  passport.authenticate("google", {
    successRedirect: process.env.CLIENT_HOME_PAGE_URL,
    failureRedirect: process.env.LOGIN_FAIL_URL,
  })
);

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

// Github router
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/redirect",
  passport.authenticate("github", {
    successRedirect: process.env.CLIENT_HOME_PAGE_URL,
    failureRedirect: process.env.LOGIN_FAIL_URL,
  })
);

// General router
router.get("/login/success", (req, res) => {
  if (req.user) {
    return res.json({
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

router.get("/logout", (req, res) => {
  req.logOut();
  req.session = null;
  res.status(200).send({
    msg: "Logged out",
  });
});

module.exports = router;
