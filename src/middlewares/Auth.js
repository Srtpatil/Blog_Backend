const passport = require("passport");
const passportJwt = require("passport-jwt");
const User = require("../models/user.model");
require("dotenv").config();

const ExtractJwt = passportJwt.ExtractJwt;
const Strategy = passportJwt.Strategy;

const params = {
  secretOrKey: process.env.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken("jwt"),
};

const Auth = () => {
  const strategy = new Strategy(params, async (payload, done) => {
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
  });

  passport.use(strategy);

  return {
    initialize: () => {
      return passport.initialize();
    },
    authenticate: () => {
      return passport.authenticate("jwt", { session: false });
    },
  };
};

module.exports = Auth;
