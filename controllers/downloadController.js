const express = require("express");
const router = express.Router();


const download = require("../services/download.service");
// File Submit Route
router.get("/file", download.file);
router.get("/files", download.files);
module.exports = router;
