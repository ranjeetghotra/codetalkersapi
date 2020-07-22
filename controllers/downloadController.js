const express = require("express");

const router = express.Router();

const GridFsStorage = require("multer-gridfs-storage");
const multer = require('multer');
const gfs = require("../config/gfs");

const download = require("../services/download.service");
// File Submit Route
router.get("/file", download.file);
module.exports = router;
