var crypto = require("crypto");
var jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  phone: {
    type: String,
    unique: true,
  },
  phoneOtp: {
    type: String,
  },
  phoneVerified: {
    type: Boolean,
    default: false,
  },
  accountType: {
    type: String,
  },
  referenceID: {
    type: String,
  },
  profilePicture: {
    type: String,
  },
  userAddress: {
    type: String,
  },
  organisationDetails: {
    type: String,
  },
  registerationDateTime: {
    type: Date,
    default: new Date(),
  },
  subscriptionValidDateTime: {
    type: Date,
    default: getSubscriptionDate(6),
  },
  permission: {
    type: Number,
    default: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  forcePasswordReset: {
    type: Boolean,
    default: false,
  },
  hash: String,
  salt: String,
});

// Get Default Subscription date time
function getSubscriptionDate(month) {
  var date = new Date();
  return date.setMonth(date.getMonth() + month);
}

// Generating Password hash

userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
    .toString("hex");
};

// Verify Password

userSchema.methods.validPassword = function (password) {
  var hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
    .toString("hex");
  return this.hash === hash;
};

// Generating a JSON Web Token

userSchema.methods.generateJwt = function () {
  var expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      exp: parseInt(expiry.getTime() / 1000),
    },
    "SHIVAMR"
  ); // DO NOT KEEP YOUR SECRET IN THE CODE!
};

module.exports = mongoose.model("User", userSchema);
