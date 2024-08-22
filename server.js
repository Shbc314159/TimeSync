const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const app = express();

app.use(bodyParser.json());

const pool = new Pool({
    connectionString: "postgresql://database_o1pk_user:OO0kTMxl4YgHvazGn7EU7sBwEXT1zv5c@dpg-cr2ffhbtq21c73f87klg-a/database_o1pk"
});

//app.use(express.static(path.join(__dirname)));

// Send the index.html file for any request
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Listen on the environment's port or port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
