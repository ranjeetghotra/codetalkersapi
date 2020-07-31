const express = require("express");

const router = express.Router();
const gfs = require("../config/gfs");

const file = require("../services/file.service");
// File Submit Route
router.post("/upload", gfs.upload.single('file'), file.upload);
router.get("/recent", file.recent);
router.post("/explore", file.explore);
router.get("/search", file.search);
router.post("/link/:id", file.link);
router.post("/bulk", file.bulk);
router.post("/type", file.type);
router.post("/delete/:id", file.delete);
module.exports = router;
