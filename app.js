// Load database
require("./config/db");

// Load dependency
const express = require('express');
const cors = require('cors');
const passport = require('passport');

// Load Controllers
const authController = require("./controllers/authController.js");

const app = express();
const port = 3000;

// use cors for cross site allows
app.use(cors())
app.use(express.json());

// Initilize Passport
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');

// Route Configration
app.get('/', (req, res) => res.send('Hello World!'));
app.use("/auth", authController);

// Start Application
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));