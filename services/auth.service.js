const messageService = require("./message.service"); // Message service
const { check, validationResult } = require('express-validator');

// Register Function
module.exports.register = function (req, res) {

  // Check and return if validation error exists
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ status: false, message: 'check input values', errors: errors.array() });
  }
  // create user instance from user Model
  var user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    accountType: req.body.address,
    referenceID: req.body.state,
    profilePicture: req.body.country,
    userAddress: req.body.pincode,
    organisationDetails: req.body.pincode,
    phoneotp: Math.floor(Math.random() * (99999 - 10000) + 10000), // Random digits for otp
  });

  user.setPassword(req.body.password);  // Generate password hash and salt

  // sent otp to user
  user.save(function (err) {
    messageService.sendOTP(user.phone, user.phoneotp);
    res.status(200).json({ status: true });
  });
};
