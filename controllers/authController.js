// Load Dependancey
const express = require("express");
const User = require("../models/user.model");
// const authService = require("../controller/authController.js");

const router = express.Router();
const { check, validationResult } = require('express-validator');

const auth = require("../services/auth.service");

// Register Route
router.post("/register",[
    check('name').trim().isLength({ min: 3 }),
    check('phone').trim().isLength({ min: 11, max:13 }),
    check('password').trim().isLength({ min: 6 }),
    check('email').trim().normalizeEmail().isEmail()
  ],auth.register);

  module.exports = router;