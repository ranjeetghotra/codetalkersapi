const File = require("../models/file.model"); // File Model

module.exports.upload = async function (req, res, next) {
  try{
    fileTree = req.body.path.replace(/^\/|\/$/g, '');
    file = new File({
      user: '0',
      orignalName: req.file.originalname,
      fileName: req.file.filename,
      mimeType: req.file.mimetype ,
      encoding: req.file.encoding,
      destination: req.file.destination,
      size: req.file.size,
      fileTree: fileTree,
    });
    file.save();
    dir = await File.findOne({isFile: false, fileTree});
    console.log(dir);
    if(!dir) {
      dirName = fileTree.split('/').slice(-1)[0]
      dir = new File({
        user: '0',
        isFile: false,
        orignalName: dirName,
        fileTree: fileTree,
      });
      dir.save();
    }
    console.log("succ...");
  } catch (err) {
    console.log(err.message);
  }
  console.log((req.file));
  res.send();

  /*var fs = require("fs");
  var wstream = fs.createWriteStream("test.png");
  wstream.write(req.body.file);
  wstream.end();*/
};
