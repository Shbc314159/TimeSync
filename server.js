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
        const result = await pool.query('SELECT id FROM users WHERE username = $1 AND password = $2', 
            [req.body.username, req.body.password]);
        if (result.rows.length > 0) {
            res.json({message: 'Logged in successfully', id: result.rows[0].id});
        } else {
            res.status(401).json({error: 'Invalid credentials'});
        }
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.post('/calendarMonthView', async (req, res) => {
    try {
        const userid = req.body.userid;
        const month = req.body.month;
        const year = req.body.year;
        const month_start = new Date(year, month, 1, 0, 0, 0);
        const month_end = new Date(year, month + 1, 0, 23, 59, 59);

        const result = await pool.query(`
            SELECT id, name, start_time, end_time
            FROM events WHERE userID = $1
            AND end_time > $2
            AND start_time < $3`,
            [userid, month_start, month_end]
        );

        const addedeventids = await pool.query(`SELECT eventID FROM usersAddedToEvents WHERE userID = $1`, [userid]);
        for (let row of addedeventids.rows) {
            const id = row.eventid;
            let data = await pool.query(`
                SELECT id, name, start_time, end_time 
                FROM events WHERE id = $1
                AND end_time > $2
                AND start_time < $3`,
                [id, month_start, month_end] 
            );

            if (data.rows.length > 0) {
                result.rows.push(...data.rows);
            }
        }

        res.json(result.rows);
    }
    catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.post('/getfriends', async (req, res) => {
    try {
        const userid = req.body.userid;
        const result1 = await pool.query(`
            SELECT user2ID
            FROM friends WHERE user1ID = $1`,
            [userid]
        );
        const result2 = await pool.query(`
            SELECT user1ID
            FROM friends WHERE user2ID = $1`,
            [userid]
        );
        
        const friendIDs = [
            ...result1.rows.map(row => parseInt(row.user2id)),
            ...result2.rows.map(row => parseInt(row.user2id))
        ];

        const friendUsernames = [];
        for (id of friendIDs) {
            const friendData = await pool.query(`
                SELECT username
                FROM users WHERE id = $1`,
                [id]
            );
            friendUsernames.push(friendData.rows[0].username);
        }

        const friendData = [];

        for (let i = 0; i < friendUsernames.length; i++) {
            friendData.push([friendIDs[i], friendUsernames[i]]);
        }

        res.json(friendData);
    }
    catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.post('/createevent', async (req, res) => {
    try {
        const userid = req.body.userid;
        const eventName = req.body.eventName;
        const eventDescription = req.body.eventDescription;
        const startTime = new Date(req.body.startTime);
        const endTime = new Date(req.body.endTime);
        const repeats = req.body.repeats;
        const addedFriends = req.body.addedFriends;
        const visibleFriends = req.body.visibleFriends;

        const eventid = await pool.query(`
            INSERT INTO events (userID, name, description, start_time, end_time, repeats)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [userid, eventName, eventDescription, startTime, endTime, repeats]
        );

        for (let friendID of addedFriends) {
            await pool.query(`
                INSERT INTO usersAddedToEvents (userID, eventID)
                VALUES ($1, $2)`,
                [friendID, eventid.rows[0].id]
            );
        }

        for (let friendID of visibleFriends) {
            await pool.query(`
                INSERT INTO eventsVisibleToUsers (userID, eventID)
                VALUES ($1, $2)`,
                [friendID, eventid.rows[0].id]
            );
        }

        res.json({message: 'Event created successfully'});
    }

    catch (err) {
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
