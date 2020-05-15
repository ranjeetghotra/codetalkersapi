// Load dependency
const express = require('express');

const app = express();
const port = 3000;

// Route Configration
app.get('/', (req, res) => res.send('Hello World!'));

// Start Application
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));