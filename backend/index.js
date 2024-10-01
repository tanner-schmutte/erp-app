const express = require("express");
const passport = require("passport");
const OAuth2Strategy = require("passport-oauth2");
const session = require("express-session");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const db = require("./models");

const app = express();

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

// Passport OAuth2 strategy configuration for Procore
passport.use(
    new OAuth2Strategy(
        {
            authorizationURL: "https://login.procore.com/oauth/authorize",
            tokenURL: "https://login.procore.com/oauth/token",
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: process.env.CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const response = await axios.get(
                    "https://api.procore.com/rest/v1.0/me",
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );

                const procoreUser = response.data;

                // Check if user exists in the database
                let user = await db.User.findOne({
                    where: { email: procoreUser.login },
                });

                // If user doesn't exist, create a new user with no permissions
                if (!user) {
                    user = await db.User.create({
                        email: procoreUser.login,
                        role: "none", // Default role for new users
                    });
                }

                // Attach the user's access token and role to the session
                const userWithRole = {
                    email: user.email,
                    role: user.role,
                    accessToken,
                };
                return done(null, userWithRole); // Pass user data (with role) to session
            } catch (error) {
                return done(error);
            }
        }
    )
);

// Serialize and deserialize user sessions
passport.serializeUser((user, done) => {
    console.log("Serializing user:", user);
    done(null, user); // Save user data in session
});
passport.deserializeUser((user, done) => {
    console.log("Deserializing user:", user);
    done(null, user); // Retrieve user data from session
});

// OAuth 2.0 login route
app.get("/auth/procore", passport.authenticate("oauth2"));

// OAuth 2.0 callback route
app.get(
    "/auth/callback",
    passport.authenticate("oauth2", { failureRedirect: "/login" }),
    (req, res) => {
        console.log("Session data after login: \n\n", req.session); // Log session data here
        res.redirect(process.env.FRONTEND_URL);
    }
);

// Protected route to fetch user info
app.get("/user", (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(req.user); // Send user data to frontend
});

app.post("/logout", (req, res) => {
    req.logout();
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Error destroying session" });
        } else {
            return res.status(200).json({ message: "Logged out successfully" });
        }
    });

    console.log("Session data after logout: \n\n", req.session);
});

// Middleware to check if the user is an admin
function isAdmin(req, res, next) {
    if (req.user && req.user.role === "admin") {
        return next();
    } else {
        return res.status(403).json({ message: "Forbidden" });
    }
}

// Route to fetch all users (admin-only)
app.get("/users", isAdmin, async (req, res) => {
    try {
        const users = await db.User.findAll(); // Fetch all users
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
});

// Start the backend server on port 3001
app.listen(3001, () => {
    console.log("Backend running on http://localhost:3001");
});
