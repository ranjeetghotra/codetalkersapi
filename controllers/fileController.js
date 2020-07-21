const express = require("express");

const router = express.Router();

const GridFsStorage = require("multer-gridfs-storage");
const multer = require('multer');
const gfs = require("../config/gfs");

const file = require("../services/file.service");
// File Submit Route
router.post("/upload", gfs.upload.single('file'), file.upload);
router.get("/recent", file.recent);
router.post("/explore", file.explore);
router.get("/link/:filename", file.link);
router.post("/type", file.type);
router.post("/delete/:id", file.delete);
module.exports = router;
