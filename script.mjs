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

// search for Artists
app.get('/uknumberones/artist/:artist', (req, res) => {
	try {
		const stmt = db.prepare('SELECT * FROM wadsongs WHERE artist = ?');
		const results = stmt.all(req.params.artist);
		res.json(results);
	} catch(error) {
		res.status(500).json({ error: error });
	}
});

// search for song by title
app.get('/uknumberones/title/:title', (req, res) => {
	try {
		const stmt = db.prepare('SELECT * FROM wadsongs WHERE title = ?');
		const results = stmt.all(req.params.title);
		res.json(results);
	} catch(error) {
		res.status(500).json({ error: error });
	}
});

// search for song by artist and title (i.e both artsist name and song title)
app.get('/uknumberones/artistttitle/:artist/:title', (req, res) => {
	try {
		const stmt = db.prepare('SELECT * FROM wadsongs WHERE artist = ? AND title = ?');
		const results = stmt.all(req.params.artist, req.params.title)
		res.json(results);
	} catch(error) {
		res.status(500).json({ error: error });
	}
});

// search for song by id
app.get('/uknumberones/id/:id', (req, res) => {
	try {
		const stmt = db.prepare('SELECT * FROM wadsongs WHERE id = ?');
		const results = stmt.all(req.params.id);
		res.json(results);
	} catch(error) {
		res.status(500).json({ error: error });
	}
});

app.get('/uknumberones/hometown/:artist', (req, res) => {
	try {
		const stmt = db.prepare('SELECT * FROM artists WHERE name = ?');
		const result = stmt.all(req.params.artist);
		res.json(result);
	} catch(error) {
		res.status(500).json({ error: error });
	}
});

app.post('/uknumberones/:id/buy', (req, res) => {
    try {
		if(req.body.quantity == "") {
			res.status(400).json({ error: "Quantity not specified"});
		} else {
			const stmt = db.prepare('UPDATE wadsongs SET quantity=quantity-? WHERE id=?');
			const info = stmt.run(req.body.quantity, req.params.id);
			if(info.changes == 1) {
				res.json({success:1});
			} else {
				res.status(404).json({error: 'No song with that ID'});
			}			
		}
    } catch(error) {
        res.status(500).json({ error: error });
    }
});

app.delete('/uknumberones/:id', (req, res) => {
    try {
        const stmt = db.prepare('DELETE FROM wadsongs WHERE id=?');
        const info = stmt.run(req.params.id);
        if(info.changes == 1) {
            res.json({success:1});
        } else {
            res.status(404).json({error: 'No song with that ID'});
        }
    } catch(error) {
        res.status(500).json({ error: error });
    }
});

app.post('/uknumberones/add', (req, res) => {
	try {
		if (req.body.title == "" || req.body.artist == "" || req.body.year == "" || req.body.downloads == "" || req.body.price == "" || req.body.quantity == "") {
			res.status(400).json({error: 'Error Bad Request! input data is empty'});
		} else {
			const stmt = db.prepare('INSERT INTO wadsongs (title, artist, year, downloads, price, quantity) VALUES (?, ?, ?, ?, ?, ?)');
			const info = stmt.run(req.body.title, req.body.artist, req.body.year, req.body.downloads, req.body.price, req.body.quantity);
			res.json({id: info.lastInsertRowid});
		}
	} catch(error) {
		res.status(500).json({ error: error });
	}
});

app.put('/uknumberones/:id', (req, res) => {
	try {
		const stmt = db.prepare('UPDATE wadsongs SET price = ?, quantity = ? WHERE id = ?');
		const info = stmt.run(req.body.price, req.body.quantity, req.params.id);
		res.status(info.changes ? 200:404).json({success: info.changes ? true: false});
	} catch(error) {
		res.status(500).json({ error: error });
	}
});

// Starting server
const PORT = 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});