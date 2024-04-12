import express from 'express';
import db from './db.mjs'

const songsRouter = express.Router();


// search for Artists
songsRouter.get('/uknumberones/artist/:artist', (req, res) => {
	try {
		const stmt = db.prepare('SELECT * FROM wadsongs WHERE artist = ?');
		const results = stmt.all(req.params.artist);
		res.json(results);
	} catch(error) {
		res.status(500).json({ error: error });
	}
});

// search for song by title
songsRouter.get('/uknumberones/title/:title', (req, res) => {
	try {
		const stmt = db.prepare('SELECT * FROM wadsongs WHERE title = ?');
		const results = stmt.all(req.params.title);
		res.json(results);
	} catch(error) {
		res.status(500).json({ error: error });
	}
});

// search for song by artist and title (i.e both artsist name and song title)
songsRouter.get('/uknumberones/artistttitle/:artist/:title', (req, res) => {
	try {
		const stmt = db.prepare('SELECT * FROM wadsongs WHERE artist = ? AND title = ?');
		const results = stmt.all(req.params.artist, req.params.title)
		res.json(results);
	} catch(error) {
		res.status(500).json({ error: error });
	}
});

// search for song by id
songsRouter.get('/uknumberones/id/:id', (req, res) => {
	try {
		const stmt = db.prepare('SELECT * FROM wadsongs WHERE id = ?');
		const results = stmt.all(req.params.id);
		res.json(results);
	} catch(error) {
		res.status(500).json({ error: error });
	}
});

songsRouter.get('/uknumberones/hometown/:artist', (req, res) => {
	try {
		const stmt = db.prepare('SELECT * FROM artists WHERE name = ?');
		const result = stmt.all(req.params.artist);
		res.json(result);
	} catch(error) {
		res.status(500).json({ error: error });
	}
});

songsRouter.post('/uknumberones/:id/buy', (req, res) => {
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

songsRouter.delete('/uknumberones/:id', (req, res) => {
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

songsRouter.post('/uknumberones/add', (req, res) => {
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

songsRouter.put('/uknumberones/:id', (req, res) => {
	try {
		const stmt = db.prepare('UPDATE wadsongs SET price = ?, quantity = ? WHERE id = ?');
		const info = stmt.run(req.body.price, req.body.quantity, req.params.id);
		res.status(info.changes ? 200:404).json({success: info.changes ? true: false});
	} catch(error) {
		res.status(500).json({ error: error });
	}
});

export default songsRouter;