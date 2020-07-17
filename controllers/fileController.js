const express = require("express");

const router = express.Router();

const file = require("../services/file.service");
// File Submit Route
router.post("/upload", file.upload);
module.exports = router;
