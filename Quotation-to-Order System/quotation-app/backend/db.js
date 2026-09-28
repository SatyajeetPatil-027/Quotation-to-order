const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "manager",   // <-- put your own password here
  database: "quotation_db",
});

module.exports = db;