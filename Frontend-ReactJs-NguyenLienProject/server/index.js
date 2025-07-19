const express = require('express');
const path = require('path');

const app = express();

const buildDir = path.join(__dirname, '../build');

const subDir = '/';
const logRequests = false;

// Serve the static files from the React app
app.use(subDir, express.static(buildDir));
// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
    if (logRequests) {
    }
    res.sendFile(path.join(buildDir, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port);
