import express from 'express';
import 'dotenv/config';
import betterSqlite3Session from 'express-session-better-sqlite3';
import expressSession from 'express-session';
import usersRouter from './routes/users.mjs';
import checkUser from './middleware/checkuser.mjs';
import * as crypto from 'crypto';
import db from './routes/db.mjs';
import Database from 'better-sqlite3';

const app = express();
const sessDb = new Database('session.db'); // sqlite database to store session data

const SqliteStore = betterSqlite3Session(expressSession, sessDb); // creates a session store

app.use(express.json()); // Necessary to read and understand JSON data from the request body

app.use(express.static('public'));

const pass = crypto.randomBytes(32).toString('hex');

app.use(expressSession({
    // Specify the session store to be used.
    store: new SqliteStore(), 

    // a secret used to digitally sign session cookie, use something unguessable (e.g. random bytes as hex) in a real application.
    secret: pass, 

    // regenerate session on each request (keeping the session active)
    resave: true, 

    // save session to store before data is stored in it (disabled as this unnecessarily creates empty sessions)
    saveUninitialized: false, 

    // resets cookies for every HTTP response. The cookie expiration time will be reset, to 'maxAge' milliseconds beyond the time of the response. 
    // Thus, the session cookie will expire after 10 mins of *inactivity* (no HTTP request made and consequently no response sent) when 'rolling' is true.
    // If 'rolling' is false, the session cookie would expire after 10 minutes even if the user was interacting with the site, which would be very
    // annoying - so true is the sensible setting.
    rolling: true, 

    // destroy session (remove it from the data store) when it is set to null, deleted etc
    unset: 'destroy', 

    // useful if using a proxy to access your server, as you will probably be doing in a production environment: this allows the session cookie to pass through the proxy
    proxy: true, 

    // properties of session cookie
    cookie: { 
        maxAge: 600000, // 600000 ms = 10 mins expiry time
        httpOnly: false // allow client-side code to access the cookie, otherwise it's kept to the HTTP messages
    }
}));

app.use('/users', usersRouter);

/*
app.use((req, res, next) => {
	console.log("Session is");
	console.log(req.session);
	next();
})
*/

app.use(checkUser);

// homepage/root route
app.get('/', (req, res) => {
	res.send('Welcome To Session Variables, Login System and Middleware!');
});

// time route
app.get('/time', (req, res) => {
	res.send(`There have been ${Date.now()} milliseconds since 1/1/70.`);
});

// Starting server
const PORT = 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});