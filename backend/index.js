const express = require("express");
const path = require("path");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();

const passport = require("./passport");
const authRoutes = require("./routes/authRoutes");
const directCostsRoutes = require("./routes/directCostsRoutes");
const externalDataRoutes = require("./routes/externalDataRoutes");
const erpRequestDetailsRoutes = require("./routes/erpRequestDetailsRoutes");
const logRoutes = require("./routes/logRoutes");
const pccoRoutes = require("./routes/pccoRoutes");
const projectRoutes = require("./routes/projectRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(express.json());

// Enable CORS for requests from frontend
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        credentials: true, // Allow credentials (cookies/sessions)
    })
);

// Serve static files from the frontend build
app.use(express.static(path.join(__dirname, "../frontend", "dist")));

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
app.use("/api", authRoutes);
app.use("/api", directCostsRoutes);
app.use("/api", externalDataRoutes);
app.use("/api", erpRequestDetailsRoutes);
app.use("/api", logRoutes);
app.use("/api", pccoRoutes);
app.use("/api", projectRoutes);
app.use("/api", userRoutes);

// Serve the frontend app for any non-API routes
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
});

// Start the backend server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
