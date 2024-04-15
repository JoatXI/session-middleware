import UserDao from "../dao/userDao.mjs";

class UserController {
    constructor(db) {
        this.dao = new UserDao(db, "ht_users");
    }

    findUSerByLogin(req, res) {
        try {
            const user = this.dao.findUserByLogin(req.body.username, req.body.password);
            if(user == null) {
                res.status(401).json({error: "Invalid username or password"});
            } else {
                res.json(user);
            }
        } catch (e) {
            res.status(500).json({error: e});
        }
        
    }

    logoutUser(req, res) {
        req.session = null;
        res.json({'success': 1 });
    }

    findUserBySession(req, res) {
        res.json({username: req.session.username || null} );
    }
}

export default UserController;