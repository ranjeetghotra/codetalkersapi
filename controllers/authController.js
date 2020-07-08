// Load Dependancey
const express = require("express");
const User = require("../models/user.model");
// const authService = require("../controller/authController.js");

const router = express.Router();
const { check, validationResult } = require("express-validator");

const auth = require("../services/auth.service");

// Login Route
router.post(
  "/login",
  [
    check("user").trim().isLength({ min: 3 }),
    check("password").trim().isLength({ min: 5 }),
  ],
  auth.login
);

// Social Login Route
router.post(
  "/social",
  [
    check("firstName").trim().isLength({ min: 1 }),
    check("lastName").trim().isLength({ min: 1 }),
    check("idToken").trim().isLength({ min: 1 }),
    check("provider").trim().isLength({ min: 1 }),
  ],
  auth.socialLogin
);

// Register Route
router.post(
  "/register",
  [
    check("firstName").trim().isLength({ min: 3 }),
    check("lastName").trim().isLength({ min: 3 }),
    check("phone").trim().isLength({ min: 11, max: 13 }),
    check("password").trim().isLength({ min: 5 }),
    check("email").trim().normalizeEmail().isEmail(),
  ],
  auth.register
);

// Register Route
router.post(
  "/verify/phone",
  [check("otp").trim().isLength({ min: 4 })],
  auth.phoneVerify
);

// Register Route
router.post(
  "/forgot-password",
  [check("user").trim().isLength({ min: 2 })],
  auth.forgotPassword
);

// Register Route
router.post(
  "/reset-password",
  [
    check("resetCode").trim().isLength({ min: 3 }),
    check("user").trim().isLength({ min: 3 }),
    check("password").trim().isLength({ min: 5 }),
  ],
  auth.resetPassword
);
module.exports = router;
