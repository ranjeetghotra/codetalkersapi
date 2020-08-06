const File = require("../models/file.model"); // File Model
const User = require("../models/user.model"); // User Model
const TempFile = require("../models/tempFile.model"); // Temp File Model
const fs = require("fs");
const crypto = require("crypto");
const archiver = require("archiver");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const gfs = require("../config/gfs");
const config = require("../config/config");
const messageService = require("./message.service"); // Message service
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
        length: req.file.size,
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
  let user = req.payload._id;
  fileTree = path.replace(/^\/|\/$/g, "");
  try {
    if (req.payload.permission === 2 && req.body.user) {
      user = req.body.user;
    }
    exploreData = await File.find({ user, fileTree }).sort({
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
    let mongoQuery = {
      _id: req.params.id
    }
    if (req.payload.permission !== 2) {
      mongoQuery.user = req.payload._id
    }
    file = await File.findOne(mongoQuery); // Find file by id
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
            { user: file.user, id: req.params.id },
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
      generateZip([file], req.payload._id).then((zipFile) => {
        const secret = config.jwt.secret;
        const token = jwt.sign(
          { user: zipFile.user, id: zipFile._id },
          secret,
          {
            expiresIn: 1000 * 60 * 60,
          }
        );
        const link =
          config.baseUrl + "download/files?token=" + encodeURIComponent(token);
        return res.json({ status: true, link });
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
    var files = [];
    const ids = req.body.ids;
    for (let key in ids) {
      let mongoQuery = { _id: ids[key] };
      if (req.payload.permission !== 2) {
        mongoQuery.user = req.payload._id;
      }
      let file = await File.findOne();
      if (file) {
        files.push(file);
      }
    }
    generateZip(files, req.payload._id).then((zipFile) => {
      const secret = config.jwt.secret;
      const token = jwt.sign(
        { user: zipFile.user, id: zipFile._id },
        secret,
        {
          expiresIn: 1000 * 60 * 60,
        }
      );
      const link =
        config.baseUrl + "download/files?token=" + encodeURIComponent(token);
      return res.json({ status: true, link });
    });
  } catch (err) {
    console.log(err.message);
    res.send({ status: false, message: err.message });
  }
};

// Email files
module.exports.email = async function (req, res, next) {
  try {
    var files = [];
    var emails = req.body.emails ?? [];
    const ids = req.body.ids;
    for (let key in ids) {
      let id = ids[key];
      let file = await File.findOne({ _id: id, user: req.payload._id });
      if (file) {
        files.push(file);
      }
    }
    generateZip(files, req.payload._id).then((zipFile) => {
      emails.forEach(email => {
        messageService.sendMail(email, 'test', 'test  subject', { filename: zipFile.originalName, path: zipFile.destination + '/' + zipFile.filename });
      });
      return res.json({ status: true });
    });
  } catch (err) {
    console.log(err.message);
    res.send({ status: false, message: err.message });
  }
};

// delete file or Directory
module.exports.delete = async function (req, res, next) {
  try {
    let mongoQuery = {
      _id: req.params.id
    }
    if (req.payload.permission !== 2) {
      mongoQuery.user = req.payload._id
    }
    file = await File.findById(mongoQuery);
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

// get storage info
module.exports.storage = async function (req, res, next) {
  try {
    let usedStorage = 0;
    files = await File.find({ user: req.payload._id, isFile: true });
    files.forEach(file => {
      usedStorage += file.length ?? 0;
    });
    res.send({ status: true, data: { used: usedStorage, total: -1 } });
  } catch (err) {
    console.log(err.message);
    res.send({ status: false, message: err.message });
  }
}

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

async function generateZip(directories, userId) {
  try {
    let randomName = 'file_' + Date.now().toString(16) + '_' + crypto.randomBytes(16).toString('hex');
    var output = fs.createWriteStream('temp/' + randomName);
    var archive = archiver("zip", {
      zlib: { level: 9 }, // Sets the compression level.
    });

    let tempFile = TempFile({
      originalName: (directories.length === 1 ? directories[0].originalName + '.zip' : 'Download.zip'),
      filename: randomName,
      destination: 'temp',
      mimeType: 'application/zip',
      user: userId
    });
    tempFile.save();

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on('close', function () {
      tempFile.length = archive.pointer();
      tempFile.save();
    });

    // This event is fired when the data source is drained no matter what was the data source.
    // It is not part of this library but rather from the NodeJS Stream API.
    // @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on('end', function () {
      console.log('Data has been drained');
    });

    // pipe archive data to the file
    archive.pipe(output);

    // var promiseArrayFirst = []
    var promiseArray = [];
    var promiseArray2 = [];

    const user = await User.findById(userId);

    // while all directories not processod
    while (directories.length) {
      let directoriesNew = [];
      for (let i = 0; i < directories.length; i++) {
        let dir = directories[i];
        let promise3 = await new Promise(async (resolve) => {
          if (!dir.isFile) {
            let mongoQuery = { fileTree: (dir.fileTree + '/' + dir.originalName).replace(/^\/|\/$/g, "") };
            if (user.permission !== 2) {
              mongoQuery.user = userId;
            }
            let files = await File.find(mongoQuery);
            for (let fkey in files) {
              let file = files[fkey];
              promiseArray2.push(new Promise(async (resolve2) => {
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
                      archive.append(buffer, { name: (dir.relativePath ?? '') + '/' + dir.originalName + '/' + file.originalName });
                      resolve2();
                    });
                  } else {
                    resolve2();
                  }
                } else {
                  file.relativePath = (dir.relativePath ? dir.relativePath + '/' : '') + dir.originalName;
                  directoriesNew.push(file);
                  resolve2();
                }
              }));
            }
            resolve();
          } else {
            fsFile = await getFsFile(dir.fileId);
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
                archive.append(buffer, { name: dir.originalName });
                resolve();
              });
            } else {
              resolve();
            }
          }
        })
      };
      directories = directoriesNew;
    }
    return new Promise((resolve) => {
      Promise.all(promiseArray).then(() => {
        Promise.all(promiseArray2).then(() => {
          archive.finalize().then(() => {
            resolve(tempFile);
          });
        })
      })
    })
  } catch (err) {
    console.log(err);
  }
}


