const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");

const connectDB = require("./db");
const User = require("./models/UserClass");
const auth = require("./middleware/auth");

const app = express();

connectDB();

// Middleware
app.use(bodyParser.json());

app.use(session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: true
}));

// ================= REGISTER =================
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    const user = new User(username, password);
    const result = await user.register();

    res.send(result.message);
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = new User(username, password);
    const result = await user.login();

    if (result.success) {
        req.session.user = username;
        res.send("Login successful");
    } else {
        res.send("Invalid credentials");
    }
});

app.get("/dashboard", auth, (req, res) => {
    res.send(`Welcome ${req.session.user}`);
});

// ================= LOGOUT =================
app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.send("Logout successful");
    });
});

// Start Server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});