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
        const og_id = req.body.og_id;

        const eventid = await pool.query(`
            INSERT INTO events (userID, name, description, start_time, end_time, repeats, og_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [userid, eventName, eventDescription, startTime, endTime, repeats, og_id]
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

        res.json({message: 'Event created successfully', id: eventid.rows[0].id});
    }

    catch (err) {
        res.status(500).json({error: err.message});
    } 
});

app.post('/createrepeatedevent', async (req, res) => {
    try {
        const userid = req.body.userid;
        const eventName = req.body.eventName;
        const eventDescription = req.body.eventDescription;
        const startTimes = req.body.startTimes;
        const endTimes = req.body.endTimes;
        const repeats = req.body.repeats;
        const addedFriends = req.body.addedFriends;
        const visibleFriends = req.body.visibleFriends;
        const og_id = req.body.og_id;

        const eventIds = [];

        for (let i = 0; i < startTimes.length; i++) {
            const eventid = await pool.query(`
                INSERT INTO events (userID, name, description, start_time, end_time, repeats, og_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
                [userid, eventName, eventDescription, startTimes[i], endTimes[i], repeats, og_id]
            );

            eventIds.push(eventid.rows[0].id);

            // Add friends to usersAddedToEvents table
            for (let friendID of addedFriends) {
                await pool.query(`
                    INSERT INTO usersAddedToEvents (userID, eventID)
                    VALUES ($1, $2)`,
                    [friendID, eventid.rows[0].id]
                );
            }

            // Make the event visible to friends in eventsVisibleToUsers table
            for (let friendID of visibleFriends) {
                await pool.query(`
                    INSERT INTO eventsVisibleToUsers (userID, eventID)
                    VALUES ($1, $2)`,
                    [friendID, eventid.rows[0].id]
                );
            }
        }

        res.json({ message: 'Events created successfully', eventIds });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/getVisible', async (req, res) => {
    try {
        const userid = req.body.userid;
        const result = await pool.query(`
            SELECT eventsVisible
            FROM users WHERE id = $1`,
            [userid]
        );
        res.json({ eventsVisible: result.rows[0].eventsvisible });
    }
    catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.post('/switchVisible', async (req, res) => {
    try {
        const userid = req.body.userid;
        const result = await pool.query(`
            UPDATE users
            SET eventsVisible = NOT eventsVisible
            WHERE id = $1`,
            [userid]
        );

        res.json(result);
    }
    catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.post('/calendarDayView', async (req, res) => {
    try {
        const userid = req.body.userid;
        const month = req.body.month;
        const year = req.body.year;
        const day = req.body.day;
        const day_start = new Date(year, month, day, 0, 0, 0);
        const day_end = new Date(year, month, day, 23, 59, 59);

        const result = await pool.query(`
            SELECT id, name, start_time, end_time
            FROM events WHERE userID = $1
            AND end_time > $2
            AND start_time < $3`,
            [userid, day_start, day_end]
        );

        const addedeventids = await pool.query(`SELECT eventID FROM usersAddedToEvents WHERE userID = $1`, [userid]);
        for (let row of addedeventids.rows) {
            const id = row.eventid;
            let data = await pool.query(`
                SELECT id, name, start_time, end_time 
                FROM events WHERE id = $1
                AND end_time > $2
                AND start_time < $3`,
                [id, day_start, day_end] 
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

app.post('/getEventInfo', async (req, res) => {
    try {
        const eventid = req.body.eventid;

        const result = await pool.query(`
            SELECT name, description, start_time, end_time, repeats
            FROM events WHERE id = $1`,
            [eventid]
        );

        const visibleFriends = await pool.query(`
            SELECT u.id, u.username
            FROM eventsVisibleToUsers evu
            JOIN users u ON evu.userID = u.id
            WHERE evu.eventID = $1`,
            [eventid]
        );

        const addedFriends = await pool.query(`
            SELECT u.id, u.username
            FROM usersAddedToEvents uae
            JOIN users u ON uae.userID = u.id
            WHERE uae.eventID = $1`,
            [eventid]
        );

        res.json({result: result.rows[0], visibleFriends: visibleFriends.rows, addedFriends: addedFriends.rows});
    }

    catch (err) {
        res.status(500).json({error: err.message});
    }
});

app.post('/deleteEvent', async (req, res) => {
    try {
        const eventid = req.body.eventid;
        const eventResult = await pool.query(`
            SELECT repeats, og_id, start_time FROM events WHERE id = $1
        `, [eventid]);

        const event = eventResult.rows[0];
        let originalId = event.og_id || eventid;

        if (event.repeats > 0) {
            await pool.query(`
                DELETE FROM usersAddedToEvents WHERE eventID IN (
                    SELECT id FROM events WHERE og_id = $1 AND start_time > $2)
            `, [originalId, event.start_time]);

            await pool.query(`
                DELETE FROM eventsVisibleToUsers WHERE eventID IN (
                    SELECT id FROM events WHERE og_id = $1 AND start_time > $2)
            `, [originalId, event.start_time]);

            await pool.query(`
                DELETE FROM events WHERE og_id = $1 AND start_time > $2
            `, [originalId, event.start_time]);
        }

        const query2 = await pool.query(`
            DELETE FROM usersAddedToEvents WHERE eventID = $1`,
            [eventid]
        );
        const query3 = await pool.query(`
            DELETE FROM eventsVisibleToUsers WHERE eventID = $1`,
            [eventid]
        );
        const query1 = await pool.query(`
            DELETE FROM events WHERE id = $1`,
            [eventid]
        );
        res.json({message: 'Event deleted successfully'});
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
