const config = require("./config");
const crypto = require("crypto");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");

// connection
const conn = mongoose.createConnection(config.db.connenction, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// init gfs
let gfs;
conn.once("open", () => {
  // init stream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "fs",
  });
  module.exports.gfs = gfs
});

// Storage
const storage = new GridFsStorage({
  url: config.db.connenction,
  file: (req, file) => {
    return { bucketName: "fs" }
  }
});

const upload = multer({
    storage
});
module.exports.upload = upload