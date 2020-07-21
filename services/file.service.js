const File = require("../models/file.model"); // File Model
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const gfs = require("../config/gfs");
// upload single file
module.exports.upload = async function (req, res, next) {
  try {
    let path = req.body.path ? req.body.path : "";
    fileTree = path.replace(/^\/|\/$/g, "");
    if (fileTree !== "") {
      dirPath = fileTree.split("/").slice(0, -1).join("/");
      dirName = fileTree.split("/").slice(-1)[0];
      dir = await File.findOne({
        isFile: false,
        fileTree: dirPath,
        originalName: dirName,
      });
      if (!dir) {
        dirName = dirName;
        dir = new File({
          user: "0",
          isFile: false,
          originalName: dirName,
          fileTree: dirPath,
        });
        dir.save();
      }
    }
    const fsFile = await gfs.gfs
      .find({
        filename: req.file.filename,
      })
      .toArray();

    if (!fsFile || fsFile.length === 0) {
      return res.status(404).json({
        status: false,
        message: "no files exist",
      });
    } else {
      file = new File({
        user: "0",
        originalName: req.file.originalname,
        fileId: fsFile[0]._id,
        filename: fsFile[0].filename,
        type: req.file.mimetype.split("/")[0],
        fileTree: fileTree,
      });
      file.save();
      res.send({ status: true, message: "Successfully Uploaded" });
    }
  } catch (err) {
    console.log(err.message);
    res.send({ status: false, message: err.message });
  }
};

// Recent modified files
module.exports.recent = async function (req, res, next) {
  try {
    recent = await File.find({ isFile: true })
      .sort({ modifiedAt: -1 })
      .limit(10);
    res.send({ status: true, data: recent });
  } catch (err) {
    console.log(err.message);
    res.send({ status: false, message: err.message });
  }
};

// Recent modified files
module.exports.explore = async function (req, res, next) {
  let path = req.body.path ? req.body.path : "";
  fileTree = path.replace(/^\/|\/$/g, "");
  try {
    recent = await File.find({ fileTree }).sort({ originalName: 1 });
    res.send({ status: true, data: recent });
  } catch (err) {
    console.log(err.message);
    res.send({ status: false, message: err.message });
  }
};

// Recent modified files
module.exports.type = async function (req, res, next) {
  try {
    let type = req.body.type;
    files = await File.find({ type }).sort({ originalName: 1 });
    res.send({ status: true, data: files });
  } catch (err) {
    console.log(err.message);
    res.send({ status: false, message: err.message });
  }
};

// Direct link for file
module.exports.link = async function (req, res, next) {
  try {
    mediaAction = req.query.media == "download" ? "attachment" : "inline";
    file = await File.findOne({ user: "0", _id: req.params.id });
    console.log(file);
    const gfsFile = gfs.gfs
      .find(new mongoose.Types.ObjectId(file._id))
      .toArray((err, files) => {
        console.log(files);
        if (!files || files.length === 0) {
          return res.status(404).json({
            status: false,
            message: "no files exist",
          });
        } else {
          gfs.gfs.openDownloadStreamByName(files[0].filename).pipe(res);
        }
      });
    /*res.set("Content-Type", file.mimeType);
    res.set(
      "Content-disposition",
      mediaAction + '; filename="' + file.originalName + '"'
    );
    res.sendFile(path.resolve(file.destination + "/" + file.fileName));*/
  } catch (err) {
    console.log(err.message);
    res.send({ status: false, message: err.message });
  }
};

// delete file or Directory
module.exports.delete = async function (req, res, next) {
  try {
    file = await File.findById(req.params.id);
    if (file) {
      if (file.isFile) {
        gfs.gfs.delete(new mongoose.Types.ObjectId(file.fileId), (err, data) => {
          if (err) {
            return res
              .status(404)
              .json({ status: false, message: err.message });
          }
          file.remove();
        });
      } else {
        files = await File.find({
          fileTree: (file.fileTree + "/" + file.originalName).replace(
            /^\/|\/$/g,
            ""
          ),
        });
        files.forEach((element) => {
          gfs.gfs.delete(new mongoose.Types.ObjectId(element.fileId), (err, data) => {
            if (err) {
              return res
                .status(404)
                .json({ status: false, message: err.message });
            }
            element.remove();
          });
        });
        file.remove();
      }
      res.send({ status: true, message: "Delete Successfully" });
    } else {
      res.send({ status: false, message: "Not Available" });
    }
  } catch (err) {
    console.log(err.message);
    res.send({ status: false, message: err.message });
  }
};
