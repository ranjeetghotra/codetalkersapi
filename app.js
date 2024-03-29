// Load database
require("./config/db");

// Load dependency
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const bodyParser = require("body-parser");

const https = require("https");
const fs = require("fs");

var timeout = require('connect-timeout');


const config = require("./config/config");
/*
const options = {
  key: fs.readFileSync("./security/server.key"),
  cert: fs.readFileSync("./security/server.crt"),
};
*/

// Load Controllers
const authController = require("./controllers/authController");
const fileController = require("./controllers/fileController");
const downloadController = require("./controllers/downloadController");
const adminController = require("./controllers/adminController");
// const twitterController = require("./controllers/twittercontroller");

const app = express();
const port = 3000;

// use cors for cross site allows
app.use(cors());

app.use(timeout(360000000));

// for parsing application/json
app.use(bodyParser.json({ limit: "50000mb" }));

// for parsing application/xwww-
app.use(
  bodyParser.urlencoded({
    limit: "50000mb",
    extended: true,
    parameterLimit: 50000,
  })
);

// verify user token
var jwt = require('express-jwt');
var auth = jwt({
  secret: config.jwt.secret,
  userProperty: 'payload',
  algorithms: ['HS256']
});

// for parsing multipart/form-data
// app.use(upload.array());
// app.use(express.static("public"));

// Initilize Passport
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport");

// Route Configration
app.get("/", (req, res) => res.send("Hello World!"));
app.use("/auth", authController);
app.use("/file", auth, fileController);
app.use("/admin", auth, adminController);
app.use("/download", downloadController);
// app.use("/twitter", twitterController);

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.send({ status: false, tokenInvalid: true, message: 'invalid token...' });
  }
});
// Start Application

var server = app.listen(port, () =>
  console.log(
    `listening at http://${server.address().address}:${server.address().port}`
  )
);
/*
https.createServer(options, app).listen(port, () =>
console.log(`Example app listening at http://localhost:${port}`)
);
*/
