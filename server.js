const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const app = express();

app.use(bodyParser.json());
/*
const pool = new Pool({ 
    user: 'postgres',
    host: 'localhost',
    port: 5432,
    database: 'local',
    password: 'mitsPost27',
});

*/
const pool = new Pool({
    connectionString: "postgresql://database_o1pk_user:OO0kTMxl4YgHvazGn7EU7sBwEXT1zv5c@dpg-cr2ffhbtq21c73f87klg-a/database_o1pk"
});


app.use(express.static(path.join(__dirname)));

app.post('/signup', async (req, res) => {
    try {
        const result = await pool.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id', [req.body.username, req.body.password]);
        res.status(201).json({id: result.rows[0].id});
    } catch (err) {
        res.status(500).json({error: err.message});
    }
}); 

app.post('/login', async (req, res) => {
    try {
        const result = await pool.query('SELECT id FROM users WHERE username = $1 AND password = $2', [req.body.username, req.body.password]);
        if (result.rows.length > 0) {
            res.json({message: 'Logged in successfully', id: result.rows[0].id});
        } else {
            res.status(401).json({error: 'Invalid credentials'});
        }
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
