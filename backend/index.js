const express = require("express");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();

const passport = require("./passport");
const authRoutes = require("./routes/authRoutes");
const directCostsRoutes = require("./routes/directCostsRoutes");
const externalDataRoutes = require("./routes/externalDataRoutes");
const logRoutes = require("./routes/logRoutes");
const projectRoutes = require("./routes/projectRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(express.json());

// Enable CORS for requests from frontend
app.use(
    cors({
        origin: process.env.FRONTEND_URL, // Allow requests from frontend
        credentials: true, // Allow credentials (cookies/sessions)
    })
);

// Session setup (stores user login state)
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    })
);

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// Use routes
app.use(authRoutes);
app.use(directCostsRoutes);
app.use(externalDataRoutes);
app.use(logRoutes);
app.use(projectRoutes);
app.use(userRoutes);

// Start the backend server on port 3001
app.listen(3001, () => {
    console.log("Backend running on http://localhost:3001");
});
