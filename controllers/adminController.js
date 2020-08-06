const express = require("express");
const router = express.Router();

const admin = require("../services/admin.service");
// All user list
router.get("/users", admin.users);
module.exports = router;