// Load database
require("./config/db");

// Load dependency
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const bodyParser = require("body-parser");

const https = require("https");
const fs = require("fs");


const options = {
  key: fs.readFileSync("./security/server.key"),
  cert: fs.readFileSync("./security/server.crt"),
};

// Load Controllers
const authController = require("./controllers/authController.js");
const fileController = require("./controllers/fileController.js");
const twitterController = require("./controllers/twittercontroller");

const app = express();
const port = 3000;

// use cors for cross site allows
app.use(cors());

// for parsing application/json
app.use(bodyParser.json({ limit: "50mb" }));

// for parsing application/xwww-
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

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
app.use("/file", fileController);
app.use("/twitter", twitterController);

// Start Application
/*
var server = app.listen(port, () =>
  console.log(
    `listening at http://${server.address().address}:${server.address().port}`
  )
);*/

https.createServer(options, app).listen(port, () =>
console.log(`Example app listening at http://localhost:${port}`)
);

