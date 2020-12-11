const db = require("sync-mysql");
const connection = new db({
    host:"localhost",
    user:"root",
    password:"root",
    database:"rental_bicycles"
});

module.exports = connection;