const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const path = require("path");

module.exports = session({
    store: new SQLiteStore({
        db: "sessions.sqlite",
        dir: path.join(__dirname, ".."),
    }),
    // Prefer setting SESSION_SECRET in a .env file or environment variable
    secret: process.env.SESSION_SECRET || "dev_secret_change_me",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60, // 1 hour
    },
});
