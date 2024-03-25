import express from 'express';
import db from './db.mjs'

const usersRouter = express.Router();


usersRouter.post('/login', (req, res) => {
	try {
		const stmt = db.prepare('SELECT * FROM ht_users WHERE username = ? AND password = ?')
		const results = stmt.all(req.body.username, req.body.password);
		if(results.length == 1) {
			req.session.username = results[0].username;
			res.json({"username": results[0].username});
		} else {
			res.status(401).json({error: "Invalid Login, Try again!"});
		}
	} catch(error) {
		res.status(500).json({ error: error });
	}
});

// Logout route
usersRouter.post('/logout', (req, res) => {
    req.session = null;
    res.json({'success': 1 });
});

// 'GET' login route - useful for clients to obtain currently logged in user
usersRouter.get('/login', (req, res) => {
    res.json({username: req.session.username || null} );
});

export default usersRouter;