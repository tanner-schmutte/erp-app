const express = require("express");
const passport = require("passport");
const OAuth2Strategy = require("passport-oauth2");
const session = require("express-session");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Enable CORS for requests from your frontend (http://localhost:5173)
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
                // Fetch user info from Procore's API
                const response = await axios.get(
                    "https://api.procore.com/rest/v1.0/me",
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }
                );
                const user = response.data;
                user.accessToken = accessToken;
                return done(null, user); // Pass user data to session
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
            res.status(500).json({ message: "Error destroying session" });
        } else {
            res.clearCookie("connect.sid");
        }
    });

    console.log("Session data after logout: \n\n", req.session);
});

// Start the backend server on port 3001
app.listen(3001, () => {
    console.log("Backend running on http://localhost:3001");
});
