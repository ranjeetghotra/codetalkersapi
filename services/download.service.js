const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");
const gfs = require("../config/gfs");
const File = require("../models/file.model"); // File Model
const TempFile = require("../models/tempFile.model"); // Temp File Model
const config = require("../config/config");
// download file or Directory
module.exports.file = async function (req, res, next) {
  try {
    var decoded = await jwt.verify(req.query.token, config.jwt.secret);
    if (decoded) {
      file = await File.findOne({ user: decoded.user, _id: decoded.id });
      if (file) {
        const gfsFile = gfs.gfs
          .find(new mongoose.Types.ObjectId(file.fileId))
          .toArray((err, files) => {
            if (!files || files.length === 0) {
              return res.status(404).json({
                status: false,
                message: "no file exist",
              });
            } else {
              res.set("Content-Length", files[0].length);
              res.set(
                "Content-disposition",
                'attachment; filename="' + file.originalName + '"'
              );
              let readableStream = gfs.gfs
                .openDownloadStreamByName(files[0].filename)
                .pipe(res);
            }
          });
      } else {
        return res.status(404).json({
          status: false,
          message: "no file exist",
        });
      }
    }
  } catch (err) {
    // err
    res.send({ status: false, message: err.message });
  }
};

// download files or Directory
module.exports.files = async function (req, res, next) {
  try {
    var decoded = await jwt.verify(req.query.token, config.jwt.secret);
    if (decoded) {
      file = await TempFile.findOne({ user: decoded.user, _id: decoded.id });
      if (file) {
        res.set('Content-Type', file.mimeType);
        res.set('Content-disposition', 'attachment; filename="' + file.originalName + '"');
        res.sendFile(path.resolve(file.destination + "/" + file.filename));
      } else {
        return res.status(404).json({
          status: false,
          message: "no file exist",
        });
      }
    }
  } catch (err) {
    // err
    console.log(err);
    res.send({ status: false, message: err.message });
  }
};