const mongoose = require("mongoose");

var fileSchema = new mongoose.Schema({
  user: {
    type: String,
  },
  isFile: {
    type: Boolean,
    default: true,
  },
  originalName: {
    type: String,
  },
  fileId: {
    type: String,
  },
  filename: {
    type: String,
  },
  type: {
    type: String,
  },
  fileTree: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  modifiedAt: {
    type: Date,
    default: new Date(),
  }
});

module.exports = mongoose.model("File", fileSchema);
