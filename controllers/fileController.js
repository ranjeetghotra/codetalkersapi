const express = require("express");

const router = express.Router();

const multer = require('multer');
const upload = multer({ dest: 'uploads'});

const file = require("../services/file.service");
// File Submit Route
router.post("/upload", upload.single('file'), file.upload);
router.get("/recent", file.recent);
router.post("/explore", file.explore);
router.get("/link/:id", file.link);
router.post("/type", file.type);
router.post("/delete/:id", file.delete);
module.exports = router;
