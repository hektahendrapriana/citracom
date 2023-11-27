const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(
  "./test.db",
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      return console.error(err.message);
    } else {
      console.log("Connected to the SQLite database.");
    }
  }
);