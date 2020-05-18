var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var mongoose = require("mongoose");
var User = mongoose.model("User");
const Auth = require("../services/auth.service");

passport.use(
  new LocalStrategy(
    {
      usernameField: "user",
    },
    function (user, password, done) {
      User.findOne({$or:[{email: user}, {phone: user }] },
        function (err, user) {
          if (err) {
            return done(err);
          }
          // Return if user not found in database
          if (!user) {
            return done(null, false, {
              status: false,
              message: "User not found",
            });
          }
          // Return if password is wrong
          if (!user.validPassword(password)) {
            return done(null, false, {
              status: false,
              message: "Password is wrong",
            });
          }
          // Check phone verified or not
          if (!user.phoneVerified) {
            // Auth.generatePhoneOtp(user)
            return done(null, false, {
              status: false,
              otp: true,
              message: "Phone not verified",
            });
          }
          // Check Active or not
          if (!user.isActive) {
            return done(null, false, {
              status: false,
              otp: true,
              message: "Account not Activated",
            });
          }
          // If credentials are correct, return the user object
          return done(null, user);
        }
      );
    }
  )
);
