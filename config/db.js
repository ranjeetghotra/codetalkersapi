const mongoose = require("mongoose");
const config = require("./config");

mongoose.connect(
  config.db.connenction,
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
  (err) => {
    if (err) {
      console.log("Error in DB connection : " + err);
    } else {
      console.log("connection successful");
    }
  }
);
