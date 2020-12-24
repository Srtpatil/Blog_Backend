const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const GithubStrategy = require("passport-github2").Strategy;
const User = require("../models/user.model");
require("dotenv").config();

const callback = async (accessToken, refreshToken, profile, done) => {
  const user = await User.findOne({
    where: {
      socialId: profile.id,
    },
  });
  if (!user) {
    console.log("Creating new User");
    const newUser = await await User.create({
      name: profile.displayName,
      email: profile.emails[0].value,
      socialId: profile.id,
    });

    if (newUser) {
      return done(null, newUser);
    }
  } else {
    return done(null, user);
  }
};

// serialize the user.id to save in the cookie session
// so the browser will remember the user when login
passport.serializeUser((user, done) => {
  done(null, user.socialId);
});

// deserialize the cookieUserId to user in the database
passport.deserializeUser(async (id, done) => {
  const user = await User.findOne({
    where: {
      socialId: id,
    },
  }).catch((err) => {
    done(new Error("Failed to deserialize an user"), null);
  });

  if (user) {
    done(null, user);
  } else {
    done(new Error("Failed to deserialize an user"), null);
  }
});

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL_GOOGLE,
    },
    callback
  )
);

// Facebook strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL_FACEBOOK,
      profileFields: ["id", "displayName", "email", "picture.type(large)"],
    },
    callback
  )
);

// Github Strategy
passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL_GITHUB,
      scope: "user:email",
    },
    callback
  )
);
