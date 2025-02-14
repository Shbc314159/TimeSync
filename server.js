// Import required modules
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

// Create an Express application
const app = express();

// Use Body Parser to parse incoming JSON requests
app.use(bodyParser.json());

/*
 // Example of a local database connection pool. Commented out for reference.
 const pool = new Pool({
     user: 'postgres',
     host: 'localhost',
     port: 5432,
     database: 'local',
     password: 'mitsPost27',
});
*/
// Create a pool for connecting to the PostgreSQL database (remote config here)
const pool = new Pool({
    connectionString: "postgresql://database_o1pk_user:OO0kTMxl4YgHvazGn7EU7sBwEXT1zv5c@dpg-cr2ffhbtq21c73f87klg-a/database_o1pk"
});


// Serve static files (HTML, CSS, JS) from the current directory
app.use(express.static(path.join(__dirname)));

/**
 * Route: /signup
 * Method: POST
 * Description: Creates a new user by inserting 'username' and 'password' into the 'users' table.
 * Expects a JSON body: { username: String, password: String }
 */
app.post('/signup', async (req, res) => {
    try {
        const result = await pool.query(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id',
            [req.body.username, req.body.password]
        );
        // Return the newly created user ID
        res.status(201).json({ id: result.rows[0].id });
    } catch (err) {
        // If an error occurs, return it with a 500 status
        res.status(500).json({ error: err.message });
    }
});

/**
 * Route: /login
 * Method: POST
 * Description: Checks user credentials against the database.
 * Expects a JSON body: { username: String, password: String }
 */
app.post('/login', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id FROM users WHERE username = $1 AND password = $2',
            [req.body.username, req.body.password]
        );
        
        if (result.rows.length > 0) {
            // If user exists and credentials are correct
            res.json({ message: 'Logged in successfully', id: result.rows[0].id });
        } else {
            // If no matching user found
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Route: /calendarMonthView
 * Method: POST
 * Description: Fetches a user's events for a given month. Also checks if the user
 * is added to other events (via usersAddedToEvents) and returns those events as well.
 * Expects: { userid: Number, month: Number, year: Number }
 */
app.post('/calendarMonthView', async (req, res) => {
    try {
        const userid = req.body.userid;
        const month = req.body.month;
        const year = req.body.year;

        // Start date: first day of month at 00:00, end date: last day of month at 23:59
        const month_start = new Date(year, month, 1, 0, 0, 0);
        const month_end = new Date(year, month + 1, 0, 23, 59, 59);

        // Query the events that belong to the user
        const result = await pool.query(`
            SELECT id, name, start_time, end_time
            FROM events
            WHERE userID = $1
              AND end_time > $2
              AND start_time < $3
        `,
        [userid, month_start, month_end]);

        // Fetch event IDs where the user is added (but not the owner)
        const addedeventids = await pool.query(
            `SELECT eventID FROM usersAddedToEvents WHERE userID = $1`,
            [userid]
        );

        // For each event the user is added to, check if the event is in the range
        for (let row of addedeventids.rows) {
            const id = row.eventid;
            let data = await pool.query(`
                SELECT id, name, start_time, end_time 
                FROM events
                WHERE id = $1
                  AND end_time > $2
                  AND start_time < $3
            `, [id, month_start, month_end]);

            if (data.rows.length > 0) {
                // Combine those events with the user's own events
                result.rows.push(...data.rows);
            }
        }

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Route: /getfriends
 * Method: POST
 * Description: Fetches a user's friends by checking the 'friends' table in both directions.
 * Expects: { userid: Number }
 * Returns: A list of friend [id, username] pairs.
 */
app.post('/getfriends', async (req, res) => {
    try {
        const userid = req.body.userid;

        // Find user2ID where this user is user1
        const result1 = await pool.query(`
            SELECT user2ID
            FROM friends
            WHERE user1ID = $1
        `, [userid]);

        // Find user1ID where this user is user2
        const result2 = await pool.query(`
            SELECT user1ID
            FROM friends
            WHERE user2ID = $1
        `, [userid]);

        // Combine friend IDs
        const friendIDs = [
            ...result1.rows.map(row => parseInt(row.user2id)),
            ...result2.rows.map(row => parseInt(row.user1id))
        ];

        // Retrieve each friend's username
        const friendUsernames = [];
        for (let id of friendIDs) {
            const friendData = await pool.query(`
                SELECT username
                FROM users
                WHERE id = $1
            `, [id]);
            friendUsernames.push(friendData.rows[0].username);
        }

        // Pair each friend's ID with username
        const friendData = [];
        for (let i = 0; i < friendUsernames.length; i++) {
            friendData.push([friendIDs[i], friendUsernames[i]]);
        }

        res.json(friendData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Route: /createevent
 * Method: POST
 * Description: Creates a new event in 'events', associates added friends in 'usersAddedToEvents',
 * and sets visibility in 'eventsVisibleToUsers'. 
 * Expects:
 * {
 *   userid: Number,
 *   eventName: String,
 *   eventDescription: String,
 *   startTime: DateString,
 *   endTime: DateString,
 *   repeats: Number,
 *   addedFriends: [Number],
 *   visibleFriends: [Number],
 *   og_id: Number (original ID for repeated events, can be null)
 * }
 */
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

        // Insert the event
        const eventid = await pool.query(`
            INSERT INTO events (userID, name, description, start_time, end_time, repeats, og_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [userid, eventName, eventDescription, startTime, endTime, repeats, og_id]);

        // For each friend in addedFriends, insert a record into usersAddedToEvents
        for (let friendID of addedFriends) {
            await pool.query(`
                INSERT INTO usersAddedToEvents (userID, eventID)
                VALUES ($1, $2)
            `, [friendID, eventid.rows[0].id]);
        }

        // For each friend in visibleFriends, insert a record into eventsVisibleToUsers
        for (let friendID of visibleFriends) {
            await pool.query(`
                INSERT INTO eventsVisibleToUsers (userID, eventID)
                VALUES ($1, $2)
            `, [friendID, eventid.rows[0].id]);
        }

        res.json({ message: 'Event created successfully', id: eventid.rows[0].id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Route: /createrepeatedevent
 * Method: POST
 * Description: Creates multiple repeated events (e.g. weekly or daily) based on arrays of start/end times.
 * Similar to /createevent but loops over many start/end pairs.
 * Expects:
 * {
 *   userid: Number,
 *   eventName: String,
 *   eventDescription: String,
 *   startTimes: [DateString],
 *   endTimes: [DateString],
 *   repeats: Number,
 *   addedFriends: [Number],
 *   visibleFriends: [Number],
 *   og_id: Number
 * }
 */
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

        // For each date/time pair, create an event
        for (let i = 0; i < startTimes.length; i++) {
            const eventid = await pool.query(`
                INSERT INTO events (userID, name, description, start_time, end_time, repeats, og_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
            `, [
                userid,
                eventName,
                eventDescription,
                startTimes[i],
                endTimes[i],
                repeats,
                og_id
            ]);

            eventIds.push(eventid.rows[0].id);

            // Add each friend to usersAddedToEvents
            for (let friendID of addedFriends) {
                await pool.query(`
                    INSERT INTO usersAddedToEvents (userID, eventID)
                    VALUES ($1, $2)
                `, [friendID, eventid.rows[0].id]);
            }

            // Make event visible to selected friends
            for (let friendID of visibleFriends) {
                await pool.query(`
                    INSERT INTO eventsVisibleToUsers (userID, eventID)
                    VALUES ($1, $2)
                `, [friendID, eventid.rows[0].id]);
            }
        }

        res.json({ message: 'Events created successfully', eventIds });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Route: /getVisible
 * Method: POST
 * Description: Retrieves the "eventsVisible" boolean for a specific user
 * to see if their events are publicly visible to friends.
 * Expects: { userid: Number }
 */
app.post('/getVisible', async (req, res) => {
    try {
        const userid = req.body.userid;
        const result = await pool.query(`
            SELECT eventsVisible
            FROM users
            WHERE id = $1
        `, [userid]);
        res.json({ eventsVisible: result.rows[0].eventsvisible });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Route: /switchVisible
 * Method: POST
 * Description: Toggles the "eventsVisible" boolean for a user (show/hide events to friends).
 * Expects: { userid: Number }
 */
app.post('/switchVisible', async (req, res) => {
    try {
        const userid = req.body.userid;
        const result = await pool.query(`
            UPDATE users
            SET eventsVisible = NOT eventsVisible
            WHERE id = $1
        `, [userid]);

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Route: /calendarDayView
 * Method: POST
 * Description: Retrieves a user's events for a specific day.
 * Also checks events to which the user is added (usersAddedToEvents).
 * Expects: { userid: Number, year: Number, month: Number, day: Number }
 */
app.post('/calendarDayView', async (req, res) => {
    try {
        const userid = req.body.userid;
        const month = req.body.month;
        const year = req.body.year;
        const day = req.body.day;

        // Day start and end times
        const day_start = new Date(year, month, day, 0, 0, 0);
        const day_end = new Date(year, month, day, 23, 59, 59);

        // Fetch the user's own events
        const result = await pool.query(`
            SELECT id, name, start_time, end_time, false AS isAddedEvent
            FROM events
            WHERE userID = $1
              AND end_time > $2
              AND start_time < $3
        `, [userid, day_start, day_end]);

        // Fetch events the user is added to
        const addedeventids = await pool.query(
            `SELECT eventID FROM usersAddedToEvents WHERE userID = $1`,
            [userid]
        );

        // For each added event, check if it occurs during that day
        for (let row of addedeventids.rows) {
            const id = row.eventid;
            let data = await pool.query(`
                SELECT id, name, start_time, end_time, true AS isAddedEvent
                FROM events
                WHERE id = $1
                  AND end_time > $2
                  AND start_time < $3
            `, [id, day_start, day_end]);

            if (data.rows.length > 0) {
                result.rows.push(...data.rows);
            }
        }

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Route: /getEventInfo
 * Method: POST
 * Description: Fetches detailed information about a single event, including
 * which friends can see it and which friends are added to it.
 * Expects: { eventid: Number }
 */
app.post('/getEventInfo', async (req, res) => {
    try {
        const eventid = req.body.eventid;

        // Basic event info
        const result = await pool.query(`
            SELECT name, description, start_time, end_time, repeats
            FROM events
            WHERE id = $1
        `, [eventid]);

        // Friends who can see the event
        const visibleFriends = await pool.query(`
            SELECT u.id, u.username
            FROM eventsVisibleToUsers evu
            JOIN users u ON evu.userID = u.id
            WHERE evu.eventID = $1
        `, [eventid]);

        // Friends who are added to the event
        const addedFriends = await pool.query(`
            SELECT u.id, u.username
            FROM usersAddedToEvents uae
            JOIN users u ON uae.userID = u.id
            WHERE uae.eventID = $1
        `, [eventid]);

        res.json({
            result: result.rows[0],
            visibleFriends: visibleFriends.rows,
            addedFriends: addedFriends.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Route: /deleteEvent
 * Method: POST
 * Description: Deletes a single event. If the event repeats, it also deletes
 * all future repetitions that share the same og_id and start_time is greater
 * than the current event's start_time.
 * Expects: { eventid: Number }
 */
app.post('/deleteEvent', async (req, res) => {
    try {
        const eventid = req.body.eventid;

        // Fetch the repeat info, original ID, and start_time
        const eventResult = await pool.query(`
            SELECT repeats, og_id, start_time
            FROM events
            WHERE id = $1
        `, [eventid]);

        const event = eventResult.rows[0];
        let originalId = event.og_id || eventid;

        // If it is a repeated event, delete all future ones in the series
        if (event.repeats > 0) {
            await pool.query(`
                DELETE FROM usersAddedToEvents
                WHERE eventID IN (
                    SELECT id
                    FROM events
                    WHERE og_id = $1
                      AND start_time > $2
                )
            `, [originalId, event.start_time]);

            await pool.query(`
                DELETE FROM eventsVisibleToUsers
                WHERE eventID IN (
                    SELECT id
                    FROM events
                    WHERE og_id = $1
                      AND start_time > $2
                )
            `, [originalId, event.start_time]);

            await pool.query(`
                DELETE FROM events
                WHERE og_id = $1
                  AND start_time > $2
            `, [originalId, event.start_time]);
        }

        // Delete the single event itself
        await pool.query(`DELETE FROM usersAddedToEvents WHERE eventID = $1`, [eventid]);
        await pool.query(`DELETE FROM eventsVisibleToUsers WHERE eventID = $1`, [eventid]);
        await pool.query(`DELETE FROM events WHERE id = $1`, [eventid]);

        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Route: /getrequests
 * Method: POST
 * Description: Fetches all incoming friend requests for a user from 'friendshipRequests'.
 * Expects: { userid: Number }
 */
app.post('/getrequests', async (req, res) => {
    try {
        const userid = req.body.userid;

        // Join the request table with user data of the person who sent the request
        const result = await pool.query(`
            SELECT u.id, u.username
            FROM friendshipRequests fr
            JOIN users u ON fr.userAskId = u.id
            WHERE fr.userAnswerId = $1
        `, [userid]);

        res.json({ requests: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Route: /requestfriend
 * Method: POST
 * Description: Sends a friend request from userAskId to userAnswerId if they are not already friends.
 * Expects: { userid: Number, friendid: Number }
 */
app.post('/requestfriend', async (req, res) => {
    try {
        const userAskId = req.body.userid;
        const userAnswerId = req.body.friendid;

        // Check if they're already friends
        const currentFriends = await pool.query(`
            SELECT COUNT(*) FROM friends
            WHERE (user1id = $1 AND user2id = $2)
               OR (user1id = $2 AND user2id = $1)
        `, [userAskId, userAnswerId]);

        if (Number(currentFriends.rows[0].count) > 0) {
            // If already friends, return a 409 (Conflict)
            return res.status(409).json({ error: 'Already friends' });
        }

        // Insert a friend request record
        await pool.query(`
            INSERT INTO friendshipRequests (userAskId, userAnswerId)
            VALUES ($1, $2)
        `, [userAskId, userAnswerId]);

        res.json({ message: 'Friend request sent successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Route: /acceptrequest
 * Method: POST
 * Description: Accepts a friend request and moves it to the 'friends' table.
 * Expects: { userid: Number, friendid: Number }
 * (userid is the answerer, friendid is the request sender).
 */
app.post('/acceptrequest', async (req, res) => {
    try {
        const userAskId = req.body.friendid;
        const userAnswerId = req.body.userid;

        // Remove the request record
        await pool.query(`
            DELETE FROM friendshipRequests
            WHERE userAskId = $1
              AND userAnswerId = $2
        `, [userAskId, userAnswerId]);

        // Add them to the 'friends' table
        await pool.query(`
            INSERT INTO friends (user1id, user2id)
            VALUES ($1, $2)
        `, [userAskId, userAnswerId]);

        res.json({ message: 'Friend request accepted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Route: /removefriend
 * Method: POST
 * Description: Removes an existing friend relationship from 'friends'.
 * Expects: { userid: Number, friendid: Number }
 */
app.post('/removefriend', async (req, res) => {
    try {
        const user1id = req.body.userid;
        const user2id = req.body.friendid;

        // Delete the friendship from both directions
        await pool.query(`
            DELETE FROM friends
            WHERE (user1id = $1 AND user2id = $2)
               OR (user1id = $2 AND user2id = $1)
        `, [user1id, user2id]);

        res.json({ message: 'Friend removed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Route: /declinerequest
 * Method: POST
 * Description: Declines (deletes) a friend request record.
 * Expects: { userid: Number, friendid: Number }
 */
app.post('/declinerequest', async (req, res) => {
    try {
        const userid = req.body.userid;
        const friendid = req.body.friendid;

        await pool.query(`
            DELETE FROM friendshipRequests
            WHERE userAskId = $2
              AND userAnswerId = $1
        `, [userid, friendid]);

        res.json({ message: 'Friend request declined successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Route: /friendCalendarMonthView
 * Method: POST
 * Description: Allows a user to view a friend's calendar for the month.
 * Checks if the friend's events are visible and/or if the friend specifically
 * made events visible to the user.
 * Expects: { userid: Number, friendid: Number, month: Number, year: Number }
 */
app.post('/friendCalendarMonthView', async (req, res) => {
    try {
        const userid = req.body.userid;
        const friendid = req.body.friendid;
        const month = req.body.month;
        const year = req.body.year;
    
        // Month range
        const month_start = new Date(year, month, 1, 0, 0, 0);
        const month_end = new Date(year, month + 1, 0, 23, 59, 59);
    
        // Check if friend's events are globally visible
        let visible = await pool.query(`
            SELECT eventsvisible
            FROM users
            WHERE id = $1
        `, [friendid]);
    
        visible = visible.rows[0].eventsvisible;
        let events = [];

        // If friend's events are globally visible, get the events friend is added to
        if (visible) {
            const addedeventids = await pool.query(`
                SELECT eventID
                FROM usersAddedToEvents
                WHERE userID = $1
            `, [friendid]);

            // Check each event for the month range
            for (const row of addedeventids.rows) {
                const id = row.eventid;
                const eventData = await pool.query(`
                    SELECT id, name, start_time, end_time
                    FROM events
                    WHERE id = $1
                      AND end_time > $2
                      AND start_time < $3
                `, [id, month_start, month_end]);

                // Push into the events array
                events.push(...eventData.rows);
            }
        }
    
        // Also get events that are specifically made visible to the user
        let otherevents = await pool.query(`
            SELECT e.id, e.name, e.start_time, e.end_time
            FROM events e
            JOIN eventsvisibletousers evtu ON e.id = evtu.eventid
            WHERE evtu.userid = $1
              AND e.userid = $2
              AND e.start_time < $3
              AND e.end_time > $4
        `, [userid, friendid, month_end, month_start]);
    
        // Combine both sets of events
        const result = [...events, ...otherevents.rows];
    
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Route: /leaveEvent
 * Method: POST
 * Description: Allows a user to remove themselves from an event that they were added to
 * (i.e. remove a record from 'usersAddedToEvents').
 * Expects: { userid: Number, eventid: Number }
 */
app.post('/leaveEvent', (req, res) => {
    try {
        userid = req.body.userid;
        eventid = req.body.eventid;

        // Delete the user-event relationship
        pool.query(
            'DELETE FROM usersaddedtoevents WHERE userID = $1 AND eventID = $2',
            [userid, eventid]
        );
        res.json({ message: 'Event left successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Route: /calendarDayViewFriend
 * Method: POST
 * Description: View a friend's events for a specific day, similar to friendCalendarMonthView
 * but restricted to a single day.
 * Expects:
 * {
 *   userid: Number,
 *   friendid: Number,
 *   year: Number,
 *   month: Number,
 *   day: Number
 * }
 */
app.post('/calendarDayViewFriend', async (req, res) => {
    try {
        const userid = req.body.userid;
        const friendid = req.body.friendid;
        const month = req.body.month;
        const year = req.body.year;
        const day = req.body.day;

        // Create day start/end
        const day_start = new Date(year, month, day, 0, 0, 0);
        const day_end = new Date(year, month, day, 23, 59, 59);

        // Check if friend's events are globally visible
        let visible = await pool.query(`
            SELECT eventsvisible
            FROM users
            WHERE id = $1
        `, [friendid]);

        visible = visible.rows[0].eventsvisible;
        let events = [];

        // If globally visible, fetch the events the friend is added to
        if (visible) {
            const addedeventids = await pool.query(`
                SELECT eventID
                FROM usersAddedToEvents
                WHERE userID = $1
            `, [friendid]);

            for (const row of addedeventids.rows) {
                const id = row.eventid;
                const eventData = await pool.query(`
                    SELECT id, name, start_time, end_time
                    FROM events
                    WHERE id = $1
                      AND end_time > $2
                      AND start_time < $3
                `, [id, day_start, day_end]);

                events.push(...eventData.rows);
            }
        }

        // Also fetch events specifically visible to the user
        let otherevents = await pool.query(`
            SELECT e.id, e.name, e.start_time, e.end_time
            FROM events e
            JOIN eventsvisibletousers evtu ON e.id = evtu.eventid
            WHERE evtu.userid = $1
              AND e.userid = $2
              AND e.start_time < $3
              AND e.end_time > $4
        `, [userid, friendid, day_end, day_start]);

        const result = [...events, ...otherevents.rows];

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Route: /checkaddedfriends
 * Method: POST
 * Description: Checks if any of the given friends (in addedFriends) have overlapping
 * events in the specified time range. If they do, return their usernames.
 * Expects:
 * {
 *   startTime: DateString,
 *   endTime: DateString,
 *   addedFriends: [Number]
 * }
 */
app.post('/checkaddedfriends', async (req, res) => {
    try {
        const startTime = req.body.startTime;
        const endTime = req.body.endTime;
        const friendids = req.body.addedFriends;
        let clashfriends = [];

        // For each friend, check how many events overlap the given range
        for (const friendid of friendids) {
            const clash = await pool.query(`
                SELECT COUNT(*) AS clashes
                FROM events
                WHERE ($1 <= end_time AND $2 >= start_time)
                  AND userid = $3
            `, [startTime, endTime, friendid]);

            const clashes = parseInt(clash.rows[0].clashes, 10);

            // If there's at least one clash, add their username to the clash list
            if (clashes > 0) {
                const uname = await pool.query(`
                    SELECT username
                    FROM users
                    WHERE id = $1
                `, [friendid]);
                clashfriends.push(uname.rows[0].username);
            }
        }

        if (clashfriends.length > 0) {
            res.json({ success: true, clashfriends: clashfriends });
        } else {
            res.json({ success: false, clashfriends: [] });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Route: /scanTimes
 * Method: POST
 * Description: Scans a 7-day "universal week" for free slots of a given length (in 5-minute increments),
 * to find a time block with the fewest overlapping events. Very custom logic for scheduling suggestions.
 * Expects: { userid: Number, timelength: Number (in ms) }
 * Returns: The offset (lowest_time) in ms from a reference date (1950-01-01) that represents the best slot.
 */
app.post('/scanTimes', async (req, res) => {
    try {
        // length = time length in multiples of 5 minutes
        const length = parseInt(req.body.timelength) / (60 * 5 * 1000);
        const id = req.body.userid;

        const sleepStartStr = req.body.sleepStart;
        const sleepEndStr = req.body.sleepEnd;
        const parseTimeToMinutes = (timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        };

        const sleepStartMins = parseTimeToMinutes(sleepStartStr);
        const sleepEndMins = parseTimeToMinutes(sleepEndStr);

        // A reference date (1950-01-01) used to normalize all event times to a single "universal" week
        const uniWeekStart = new Date(1950, 0, 1, 0, 0, 0);
        const baseTime = uniWeekStart.getTime();

        // Get user events
        let events = await getUserEvents(id);
        
        // Map them to a standard 7-day week timeframe
        events = mapEventsToStdWeek(events, uniWeekStart);

        // Sort events by start time
        events = quicksort(events);

        // categories array of 12 blocks * 24 hours * 7 days = 2016 blocks
        // Each block = 5 minutes
        let categories = new Array(12 * 24 * 7).fill(0);
        let lowest = events.length;

        // For each 5-minute block, count how many events overlap
        for (let i = 0; i < categories.length; i++) {
            let start = baseTime + i * 60 * 1000 * 5;
            let end = start + 5 * 60 * 1000;
            let j = 0;
            while (j < events.length) {
                const item = events[j];
                if (item.start_time.getTime() > end) {
                    break;
                }
                if (item.end_time.getTime() < start) {
                    // This event ends before this block starts, remove it
                    events.splice(j, 1);
                } else if (item.start_time.getTime() < end) {
                    // Overlaps with the block
                    categories[i]++;
                    j++;
                } else {
                    j++;
                }
            }
        }

                // Create an array to flag sleep blocks.
        // Each day has 288 blocks (24 hours * 12 blocks per hour).
        const totalBlocksPerDay = 24 * 12; // 288
        let isSleepBlock = new Array(categories.length).fill(false);

        for (let i = 0; i < categories.length; i++) {
            // local time in minutes within the day
            const localMins = (i % totalBlocksPerDay) * 5;
            if (sleepStartMins < sleepEndMins) {
                // Sleep period does NOT span midnight.
                if (localMins >= sleepStartMins && localMins < sleepEndMins) {
                    isSleepBlock[i] = true;
                }
            } else {
                // Sleep period spans midnight (e.g., 23:00 to 07:00)
                if (localMins >= sleepStartMins || localMins < sleepEndMins) {
                    isSleepBlock[i] = true;
                }
            }
        }

        // Slide a window of length 'length' across categories to find the minimum-sum window,
        // but skip any window that includes a sleep block.
        let lowest_time = -1;
        let lowest_sum = Infinity;
        for (let i = 0; i <= categories.length - length; i++) {
            let windowIncludesSleep = false;
            let sum = 0;
            for (let j = i; j < i + length; j++) {
                if (isSleepBlock[j]) {
                    windowIncludesSleep = true;
                    break;
                }
                sum += categories[j];
            }
            if (!windowIncludesSleep && sum < lowest_sum) {
                lowest_sum = sum;
                lowest_time = i * 5 * 60 * 1000; // convert block index to milliseconds
            }
        }

        // Return the offset in milliseconds
        res.json({ lowest_time: lowest_time });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * Helper Function: getUserEvents
 * Description: Queries all events (start_time, end_time) belonging to a user.
 */
async function getUserEvents(id) {
    const events = await pool.query(
        `SELECT start_time, end_time FROM events WHERE userid = $1`,
        [id]
    );
    return events.rows;
}

/**
 * Helper Function: mapEventsToStdWeek
 * Description: Maps each event to a standard 7-day window starting from 1950-01-01, ignoring year.
 * Splits or re-maps events that cross day boundaries or are longer than 1 week.
 */
function mapEventsToStdWeek(events, weekStart) {
    let newEvents = [];

    for (let item of events) {
        let day = item.start_time.getDay() + 1;
        let hour = item.start_time.getHours();
        let minute = item.start_time.getMinutes();
        let second = item.start_time.getSeconds();
        let newStart = new Date(1950, 0, day, hour, minute, second);

        day = item.end_time.getDay() + 1;
        hour = item.end_time.getHours();
        minute = item.end_time.getMinutes();
        second = item.end_time.getSeconds();
        let newEnd = new Date(1950, 0, day, hour, minute, second);

        // If event wraps around or is longer than 7 days, split it
        if (
            (item.end_time.getDay() < item.start_time.getDay()) ||
            (item.end_time.getTime() - item.start_time.getTime() > 7 * 24 * 3600 * 1000)
        ) {
            let otherstart = new Date(1950, 0, 1, 0, 0, 0);
            let otherend = new Date(1950, 0, 7, 23, 59, 59);

            // Split into two segments within the week
            newEvents.push({
                start_time: otherstart,
                end_time: newEnd
            });

            newEvents.push({
                start_time: newStart,
                end_time: otherend
            });
        } else {
            newEvents.push({
                start_time: newStart,
                end_time: newEnd
            });
        }

        // Handle any events that might span multiple weeks
        for (
            let i = 0;
            i < Math.floor((item.end_time.getTime() - item.start_time.getTime()) / (24 * 3600 * 7 * 1000));
            i++
        ) {
            let addedstart = new Date(1950, 0, 1, 0, 0, 0);
            let addedend = new Date(1950, 0, 7, 23, 59, 59);

            newEvents.push({
                start_time: addedstart,
                end_time: addedend
            });
        }
    }

    return newEvents;
}

/**
 * Helper Function: quicksort
 * Description: Sorts an array of events by their start_time.
 */
function quicksort(arr) {
    if (arr.length <= 1) {
        return arr;
    }

    const pivot = arr[arr.length - 1];
    const pivotTime = new Date(pivot.start_time).getTime();
    const left = [];
    const right = [];

    for (let i = 0; i < arr.length - 1; i++) {
        const currentTime = new Date(arr[i].start_time).getTime();
        if (currentTime < pivotTime) {
            left.push(arr[i]);
        } else {
            right.push(arr[i]);
        }
    }

    return [...quicksort(left), pivot, ...quicksort(right)];
}

/**
 * Catch-all GET route: 
 * Serves the login.html file for any unrecognized routes.
 */
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Start the server on the specified port or default to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
