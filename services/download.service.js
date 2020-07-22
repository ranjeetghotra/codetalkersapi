const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const gfs = require("../config/gfs");
const File = require("../models/file.model"); // File Model
const config = require("../config/config");
// download file or Directory
module.exports.file = async function (req, res, next) {
  try {
    var decoded = await jwt.verify(req.query.token, config.jwt.secret);
    if (decoded) {
      file = await File.findOne({ user: decoded.user, _id: decoded.id });
      const gfsFile = gfs.gfs
        .find(new mongoose.Types.ObjectId(file.fileId))
        .toArray((err, files) => {
          if (!files || files.length === 0) {
            return res.status(404).json({
              status: false,
              message: "no files exist",
            });
          } else {
            res.set(
              "Content-disposition", 'attachment; filename="' + file.originalName + '"'
            );
            gfs.gfs.openDownloadStreamByName(files[0].filename).pipe(res);
          }
        });
    }
  } catch (err) {
    // err
    res.send({ status: false, message: err.message });
  }
};
