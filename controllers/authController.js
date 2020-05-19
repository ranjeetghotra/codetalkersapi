// Load Dependancey
const express = require("express");
const User = require("../models/user.model");
// const authService = require("../controller/authController.js");

const router = express.Router();
const { check, validationResult } = require('express-validator');

const auth = require("../services/auth.service");

// Login Route
router.post("/login",[
    check('user').trim().isLength({ min: 3 }),
    check('password').trim().isLength({ min: 5 }),
  ],auth.login);

// Register Route
router.post("/register",[
    check('firstName').trim().isLength({ min: 3 }),
    check('lastName').trim().isLength({ min: 3 }),
    check('phone').trim().isLength({ min: 11, max:13 }),
    check('password').trim().isLength({ min: 5 }),
    check('email').trim().normalizeEmail().isEmail()
  ],auth.register);

// Register Route
router.post("/verify/phone",[
    check('otp').trim().isLength({ min: 4 }),
  ],auth.phoneVerify);

  module.exports = router;