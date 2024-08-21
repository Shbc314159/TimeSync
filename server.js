// server.js
const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Send the index.html file for any request
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Listen on the environment's port or port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
