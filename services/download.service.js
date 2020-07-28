const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const JsZip = require("jszip");
const FileSaver = require('file-saver');
const gfs = require("../config/gfs");
const File = require("../models/file.model"); // File Model
const config = require("../config/config");
// download file or Directory
module.exports.file = async function (req, res, next) {
  try {
    var decoded = await jwt.verify(req.query.token, config.jwt.secret);
    console.log(decoded);
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
    const zip = new JsZip();
    var zipFile = zip.folder("download");
    var decoded = await jwt.verify(req.query.token, config.jwt.secret);
    if (decoded && Array.isArray(decoded.ids)) {
      const ids = decoded.ids;
      for (let i = 0; i < ids.length; i++) {
        file = await File.findOne({ user: decoded.user, _id: ids[i] });
        console.log(file);
        if (file) {
          const gfsFile = gfs.gfs
            .find(new mongoose.Types.ObjectId(file.fileId))
            .toArray((err, files) => {
              if (!files || files.length === 0) {
              } else {
                let readableStream = gfs.gfs.openDownloadStreamByName(
                  files[0].filename
                );
                var bufferArray = [];
                readableStream.on("data", function (chunk) {
                  bufferArray.push(chunk);
                });
                readableStream.on("end", function () {
                  console.log('end');
                  var buffer = Buffer.concat(bufferArray);
                  zipFile.file(file.originalName, buffer);
                  zip.generateAsync({ type: "nodebuffer" }).then((content) => {
                    // res.send(content.toString('base64'));
                    FileSaver.saveAs(content, "archive.zip");
                  });
                });
              }
            });
        }
      }
    }
  } catch (err) {
    // err
    res.send({ status: false, message: err.message });
  }
};

/*
async function multiDownloadAsZip(fileIds){
  const zip = new JsZip();
  const promiseArray = [];
  fileIds.forEach(fileID => {
    file = await File.findOne({ user: decoded.user, _id: ids[i] });
    promiseArray.push()
  });
}
*/