const passport = require("passport");
const session = require("express-session");
const userStore = require("../app/storages/user.store");
const FacebookStrategy = require("passport-facebook").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const flash = require("connect-flash");

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_KEY, // Replace with your JWT secret key
};

function setup(app) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  passport.use(
    new JwtStrategy(jwtOptions, async (payload, done) => {
      try {
        // Assuming you have a user model, replace this logic with your actual user retrieval
        const user = await userStore.findUserById(payload.userId);
        if (!user) {
          return done(null, false);
        }
        return done(null, {
          userId: user._id,
          role: user.role,
        });
      } catch (error) {
        return done(error, false);
      }
    })
  );

  // Save user to session
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  // Get user from session
  passport.deserializeUser(async function (user, done) {
    done(null, user);
  });
}

module.exports = { setup };
