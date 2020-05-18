const passport = require("passport");

const messageService = require("./message.service"); // Message service
const User = require("../models/user.model"); // Message service
const { check, validationResult } = require("express-validator");

// Login Function
module.exports.login = function (req, res, next) {
  // Check and return if validation error exists
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ status: false, errors: errors.array() });
  }
  passport.authenticate("local", function (err, user, info) {
    var token;

    // If Passport throws/catches an error
    if (err) {
      res.json({status: false, error: err});
      return;
    }

    // If a user is found
    if (user) {
      token = user.generateJwt();
      res.status(200);
      res.json({
        status: true,
        token: token,
      });
    } else {
      // If user is not found
      res.json(info);
    }
  })(req, res, next);
};

// Register Function
module.exports.register = function (req, res) {
  // Check and return if validation error exists
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: "check input values",
      errors: errors.array(),
    });
  }
  try {
    // create user instance from user Model
    var user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      accountType: req.body.accountType,
      referenceID: req.body.referenceID,
      profilePicture: req.body.profilePicture,
      userAddress: req.body.userAddress,
      organisationDetails: req.body.organisationDetails,
      phoneOtp: Math.floor(Math.random() * (99999 - 10000) + 10000), // Random digits for otp
    });

    user.setPassword(req.body.password); // Generate password hash and salt

    // sent otp to user
    user.save(function (err) {
      // messageService.sendOTP(user.phone, user.phoneOtp);
      res.status(200).json({ status: true });
    });
  } catch (err) {
    res.status(200).json({ status: false, message: err.message });
  }
};

// Register Function
module.exports.phoneVerify = async function (req, res) {
  // Check and return if validation error exists
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: "check input values",
      errors: errors.array(),
    });
  }
  try {
    // create user instance from user Model
    var user = await User.findOne({ phone: req.body.phone, phoneOtp: req.body.otp });
    if (user) {
      user.phoneOtp = "";
      user.phoneVerified = true;
      user.save();
      return res
        .status(200)
        .json({ status: true, message: "OTP Verified" });
    } else {
      res.status(200).json({ status: false, message: "OTP not Matched" });
    }
  } catch (err) {
    res.status(200).json({ status: false, message: err.message });
  }
};
