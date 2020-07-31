const File = require("../models/file.model"); // File Model
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const gfs = require("../config/gfs");
const config = require("../config/config");
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
        user: req.payload._id,
      });
      if (!dir) {
        dirName = dirName;
        dir = new File({
          user: req.payload._id,
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
        user: req.payload._id,
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
    recent = await File.find({ user: req.payload._id, isFile: true })
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
    exploreData = await File.find({ user: req.payload._id, fileTree }).sort({
      originalName: 1,
    });
    res.send({ status: true, data: exploreData });
  } catch (err) {
    console.log(err.message);
    res.send({ status: false, message: err.message });
  }
};

// Recent modified files
module.exports.search = async function (req, res, next) {
  let query = req.query.query;
  try {
    if (query.trim()) {
      searchData = await File.find({
        user: req.payload._id,
        originalName: { $regex: new RegExp(query.trim(), "i") },
      });
      res.send({ status: true, data: searchData });
    } else {
      return res.send({
        status: false,
        message: "Search is empty",
      });
    }
  } catch (err) {
    console.log(err.message);
    res.send({ status: false, message: err.message });
  }
};

// Recent modified files
module.exports.type = async function (req, res, next) {
  try {
    let type = req.body.type;
    files = await File.find({ user: req.payload._id, type }).sort({
      originalName: 1,
    });
    res.send({ status: true, data: files });
  } catch (err) {
    console.log(err.message);
    res.send({ status: false, message: err.message });
  }
};

// Direct link for file
module.exports.link = async function (req, res, next) {
  try {
    file = await File.findOne({ _id: req.params.id, user: req.payload._id }); // Find file by id
    if (!file) {
      // check if file exist or not
      return res.status(404).json({
        status: false,
        message: "no files exist",
      });
    } else if (file.isFile) {
      // get GridFs file
      getFsFile(file.fileId).then((fsFile) => {
        if (!fsFile) {
          return res.status(404).json({
            status: false,
            message: "no files exist",
          });
        } else {
          const secret = config.jwt.secret;
          const token = jwt.sign(
            { user: req.payload._id, id: req.params.id },
            secret,
            {
              expiresIn: 1000 * 60 * 60,
            }
          );
          const link =
            config.baseUrl + "download/file?token=" + encodeURIComponent(token);
          return res.json({ status: true, link });
        }
      });
    } else {
      files = await File.find({
        fileTree: file.fileTree + "/" + file.originalName,
        user: req.payload._id,
      });
      generateZip([file], req.payload._id).then(() => {
        res.send({});
      });
    }
  } catch (err) {
    console.log(err);
    res.send({ status: false, message: err.message });
  }
};

// Direct link for file
module.exports.bulk = async function (req, res, next) {
  try {
    const ids = req.body.ids;
    const secret = config.jwt.secret;
    const token = jwt.sign({ user: req.payload._id, ids }, secret, {
      expiresIn: 1000 * 60 * 60,
    });
    const link =
      config.baseUrl + "download/files?token=" + encodeURIComponent(token);
    return res.json({ status: true, link });
  } catch (err) {
    console.log(err.message);
    res.send({ status: false, message: err.message });
  }
};

// delete file or Directory
module.exports.delete = async function (req, res, next) {
  try {
    file = await File.findById({ user: req.payload._id, _id: req.params.id });
    if (file) {
      if (file.isFile) {
        gfs.gfs.delete(
          new mongoose.Types.ObjectId(file.fileId),
          (err, data) => {
            file.remove();
          }
        );
      } else {
        files = await File.find({
          fileTree: (file.fileTree + "/" + file.originalName).replace(
            /^\/|\/$/g,
            ""
          ),
        });
        files.forEach((element) => {
          gfs.gfs.delete(
            new mongoose.Types.ObjectId(element.fileId),
            (err, data) => {
              element.remove();
            }
          );
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

async function getFsFile(fileId) {
  return new Promise((resolve) => {
    gfs.gfs.find(new mongoose.Types.ObjectId(fileId)).toArray((err, files) => {
      if (!files || files.length === 0) {
        resolve(null);
      } else {
        resolve(files[0]);
      }
    });
  });
}

async function generateZip(directories, user) {
  try {
    var rootPath = '';
    var output = fs.createWriteStream(__dirname + "/example2.zip");
    var archive = archiver("zip", {
      zlib: { level: 9 }, // Sets the compression level.
    });

    // pipe archive data to the file
    archive.pipe(output);

    // var promiseArrayFirst = []
    var promiseArray = [];
    var promiseArray2 = [];

    // while all directories not processod
    while (directories.length) {
      console.log('loop start');
      let directoriesNew = [];
      directories.forEach((dir) => {
        console.log('each directories');
        promiseArray.push(new Promise(async (resolve) => {
          console.log('push promiseArray');
          if (!dir.isFile) {
            let files = await File.find({ fileTree: (dir.fileTree + '/' + dir.originalName).replace(/^\/|\/$/g, ""), user });
            console.log(files);
            console.log('files');
            files.forEach(async (file) => {
              await promiseArray2.push(new Promise(async (resolve2) => {
                if (file.isFile) {
                  fsFile = await getFsFile(file.fileId);
                  if (fsFile) {
                    let readableStream = gfs.gfs.openDownloadStreamByName(
                      fsFile.filename
                    );
                    let bufferArray = [];
                    readableStream.on("data", function (chunk) {
                      bufferArray.push(chunk);
                    });
                    readableStream.on("end", function () {
                      let buffer = Buffer.concat(bufferArray);
                      archive.append(buffer, { name: file.originalName });
                      resolve2();
                    });
                  } else {
                    resolve2();
                  }
                } else {
                  directoriesNew.push(dir);
                  console.log('directoriesNew.push(dir)');
                  resolve2();
                }
              }));
            })
            resolve();
          } else {
            resolve();
          }
        }))
      });
      directories = directoriesNew;
      console.log(directoriesNew);
      /*fileIds.forEach((id) => {
        let file = await File.findOne({ _id: req.params.id, user });
        let fsFile = await getFsFile(file.fileId);
        if (fsFile) {
          let readableStream = gfs.gfs.openDownloadStreamByName(
            fsFile.filename
          );
          let bufferArray = [];
          readableStream.on("data", function (chunk) {
            bufferArray.push(chunk);
          });
          readableStream.on("end", function () {
            let buffer = Buffer.concat(bufferArray);
            archive.append(buffer, { name: file.originalName });
            // resolve();
          });
        }
      }); */
      console.log('loop finish');
    }
    return new Promise((resolve) => {
      Promise.all(promiseArray).then(() => {
        console.log('all promise')
        Promise.all(promiseArray2).then(() => {
          console.log('all promise2')
          archive.finalize();
          resolve('');
        })
      })
    })
  } catch (err) {
    console.log(err);
  }
}
