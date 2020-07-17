const passport = require("passport");
const randomstring = require("randomstring");
const messageService = require("./message.service"); // Message service
const User = require("../models/user.model"); // User Model
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
      res.json({ status: false, error: err });
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
module.exports.socialLogin = async function (req, res) {
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
    const loginProvider = req.body.provider.toLowerCase();
    let user;
    if (loginProvider == "google") {
      user = await User.findOne({
        $or: [{ googleId: req.body.idToken }, { email: req.body.email }],
      });
    } else if (loginProvider == "facebook") {
      user = await User.findOne({
        $or: [{ facebookId: req.body.idToken }, { email: req.body.email }],
      });
    } else if (loginProvider == "twitter") {
      user = await User.findOne({
        $or: [{ twitterId: req.body.idToken }, { email: req.body.email }],
      });
    } else {
      return res
        .status(200)
        .json({ status: false, message: "Social login provider unavailable" });
    }
    if (!user) {
      user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        accountType: req.body.accountType,
        referenceID: loginProvider,
        profilePicture: "",
        userAddress: "",
        organisationDetails: "",
      });
      user.save();
      token = user.generateJwt();
      return res.status(200).json({ status: true, token });
    } else {
      updateSocialId(user, loginProvider, req.body.idToken);
      token = user.generateJwt();
      return res.status(200).json({ status: true, token });
    }
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// Register Function
module.exports.register = async function (req, res) {
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
    let isEmailExist = await User.findOne({ email: req.body.email });
    let isPhoneExist = await User.findOne({ phone: req.body.phone });

    if (isEmailExist) {
      return res
        .status(200)
        .json({ status: false, message: "Email already exist" });
    }
    if (isPhoneExist) {
      return res
        .status(200)
        .json({ status: false, message: "Phone already exist" });
    }
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
      messageService.sendOTP(user.phone, user.phoneOtp);
      messageService.welcomeMail(user);
      res.status(200).json({ status: true });
    });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
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
    var user = await User.findOne({
      phone: req.body.phone,
      phoneOtp: req.body.otp,
    });
    if (user) {
      user.phoneOtp = "";
      user.phoneVerified = true;
      user.save();
      token = user.generateJwt();
      return res
        .status(200)
        .json({ status: true, token, message: "OTP Verified" });
    } else {
      res.status(200).json({ status: false, message: "OTP not Matched" });
    }
  } catch (err) {
    res.status(200).json({ status: false, message: err.message });
  }
};

// Password reset request
module.exports.forgotPassword = async function (req, res) {
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
    var user = await User.findOne({
      email: req.body.user
    });
    if (user) {
      user.passwordResetCode = randomstring.generate();
      user.save();
      messageService.forgotPasswordMail(user);
      return res
        .status(200)
        .json({ status: true, message: "Password reset link has been sent to your email" });
    } else {
      res.status(200).json({ status: false, message: "Account not found" });
    }
  } catch (err) {
    res.json({ status: false, message: err.message });
  }
};

// Reset password
module.exports.resetPassword = async function (req, res) {
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
    var user = await User.findOne({
      passwordResetCode: req.body.resetCode,
      $or:[{email: req.body.user}, {phone: req.body.user }]
    });
    if (user) {
      user.passwordResetCode = '';
      user.setPassword(req.body.password);
      user.save();
      return res
        .status(200)
        .json({ status: true, message: "Password reset successfully" });
    } else {
      res.status(200).json({ status: false, message: "Account not found" });
    }
  } catch (err) {
    res.json({ status: false, message: err.message });
  }
};

async function updateSocialId(user, provider, id) {
  switch(provider) {
    case 'google': user.googleId = id; user.save(); break;
    case 'facebook': user.facebookId = id; user.save(); break;
    case 'twitter': user.twitterId = id; user.save(); break;
    default: break;
  }
}