// Load database
require("./config/db");

// Load dependency
const express = require('express');

// Load Controllers
const authController = require("./controllers/authController.js");

const app = express();
const port = 3000;

// Route Configration
app.get('/', (req, res) => res.send('Hello World!'));
app.use("/auth", authController);

// Start Application
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));