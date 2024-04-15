class UserDao {
    constructor(db, table) {
        this.db = db;
        this.table = table;
    }

    findUserByLogin(username, password) {
        const stmt = this.db.prepare(`SELECT * FROM ${this.table} WHERE username=? AND password=?`);
        const rows = stmt.all(username, password);
        if (rows.length == 0) {
            return null;
        } else {
            return rows[0];
        }
    }
}

export default UserDao;