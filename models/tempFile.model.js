const mongoose = require("mongoose");

var tempFileSchema = new mongoose.Schema({
  user: {
    type: String,
  },
  originalName: {
    type: String,
  },
  name: {
    type: String,
  },
  filename: {
    type: String,
  },
  destination: {
    type: String,
    default: ''
  },
  length: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

module.exports = mongoose.model("TempFile", tempFileSchema);
