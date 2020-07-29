const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const JsZip = require("jszip");
const FileSaver = require("file-saver");
const fs = require("fs");
const archiver = require("archiver");
const gfs = require("../config/gfs");
const File = require("../models/file.model"); // File Model
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
              var bufferArray = [];
              readableStream.on("data", function (chunk) {
                bufferArray.push(chunk);
              });
              readableStream.on("end", function () {
                var buffer = Buffer.concat(bufferArray);
                console.log(buffer);
              });
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

// download file or Directory
module.exports.files = async function (req, res, next) {
  try {
    var decoded = await jwt.verify(req.query.token, config.jwt.secret);
    if (decoded && Array.isArray(decoded.ids)) {
      // create a file to stream archive data to.
      var output = fs.createWriteStream(__dirname + "/example.zip");
      var archive = archiver("zip", {
        zlib: { level: 9 }, // Sets the compression level.
      });

      // pipe archive data to the file
      archive.pipe(output);
      const ids = decoded.ids;
      const promiseArray = [];
      console.log(ids);
      ids.forEach(id => {
        promiseArray.push(
          new Promise(async (resolve) => {
            let file = await File.findOne({ user: decoded.user, _id: id });
            if (file) {
              const gfsFile = gfs.gfs
                .find(new mongoose.Types.ObjectId(file.fileId))
                .toArray((err, files) => {
                  if (!files || files.length === 0) {
                  } else {
                    let readableStream = gfs.gfs.openDownloadStreamByName(
                      files[0].filename
                    );
                    let bufferArray = [];
                    readableStream.on("data", function (chunk) {
                      bufferArray.push(chunk);
                    });
                    readableStream.on("end", function () {
                      var buffer = Buffer.concat(bufferArray);
                      archive.append(buffer, { name: file.originalName });
                      resolve();
                    });
                  }
                });
            }
          })
        );
      });
      Promise.all(promiseArray).then(() => {
        archive.finalize();
        res.send({status: true, message: "Zip created"});
      });
    }
  } catch (err) {
    res.send({ status: false, message: err.message });
  }
};