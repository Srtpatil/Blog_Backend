const passport = require("passport");
const passportJWT = require("passport-jwt");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = passportJWT.Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const User = require("../models/user.model");
require("dotenv").config();

// This is for protected routes
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await User.findByPk(payload.id);
        if (!user) {
          return done(new Error("User Not Found"), null);
        } else if (payload.expire <= Date.now()) {
          return done(new Error("Token Expired, Login Again"), null);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(new Error("Something Wrong !"));
      }
    }
  )
);

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: false,
    },
    async (email, password, done) => {
      console.log("email: ", email, " ", password);
      return User.authenticate(email, password)
        .then((user) => {
          if (!user) {
            console.log("here2");
            return done(null, false, {
              message: "Incorrect email or password",
            });
          }

          return done(null, user, {
            message: "Logged In Successfully",
          });
        })
        .catch((err) => {
          return done(null, false, err.message);
        });
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      const user = await User.findOne({
        where: {
          email: profile.emails[0].value,
        },
      });

      if (!user) {
        const newUser = await await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          username: Math.random(36).toString(36).substr(2, 7),
        });

        if (newUser) {
          return done(null, newUser);
        }
      } else {
        return done(null, user);
      }
    }
  )
);
