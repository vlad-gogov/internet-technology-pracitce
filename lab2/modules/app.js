const database = require('./database')

module.exports.addOrder = function (date_order, id_user, id_rent, id_bicycles) {
    let result = database.query(`INSERT INTO orders SET date = ?, id_user = ?, id_rent = ?, id_bicycles = ?, id_reception = ?`,
        [date_order, id_user, id_rent, id_bicycles, 0]);
    return database.query(`SELECT * FROM orders WHERE id_order = ?`, [result.insertId])[0];
}

module.exports.userChange = function (id_user, name, phone) {
    database.query(`UPDATE users SET name = ?, telephone = ? WHERE id = ?`, [name, phone, id_user]);
    return database.query(`SELECT * FROM users WHERE id = ?`, [id_user])[0];
}

module.exports.registration = function (login, password, name, phone) {
    let result = database.query(`INSERT INTO users SET login = ?, password = ?, name = ?, telephone = ?`,
        [login, password, name, phone]);
    return database.query(`SELECT * FROM users WHERE id = ?`, [result.insertId])[0];
}

module.exports.authUserWithSession = function (session) {
    let userExists = database.query(`SELECT COUNT(*) FROM users WHERE session = ?`, [session])[0]["COUNT(*)"];
    if (!userExists)
        return { ok: false };
    let user = database.query(`SELECT * FROM users WHERE session = ?`, [session])[0];
    return { ok: true, ...user};
};

module.exports.authUserWithLogin = function (login, password) {
    let userExists = database.query(`SELECT COUNT(*) FROM users WHERE login = ? AND password = ?`, [login, password])[0]["COUNT(*)"];
    if (!userExists)
        return { ok: false };
    let user = database.query(`SELECT * FROM users WHERE login = ?`, [login])[0];
    user.session = user.id + user.login;
    database.query(`UPDATE users SET session = ? WHERE id = ?`, [user.session, user.id]);
    return { ok: true, ...user};
};

module.exports.resetSession = function (session) {
    database.query(`UPDATE users SET session = '' WHERE session = ?`, [session]);
}