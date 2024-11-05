const express = require("express");
const passport = require("passport");
const OAuth2Strategy = require("passport-oauth2");
const session = require("express-session");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const db = require("./models");

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
                    id: user.id,
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
            return res
                .status(500)
                .json({ message: "Error destroying session" });
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

// POST route to add a new user
app.post("/users", async (req, res) => {
    const { email, role } = req.body;

    // Validate email and role
    const validRoles = ["admin", "full", "limited", "none"];
    if (!validRoles.includes(role) || !email) {
        return res.status(400).json({ message: "Invalid role or email" });
    }

    try {
        // Check if the user already exists
        const existingUser = await db.User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // Create new user
        const newUser = await db.User.create({ email, role });

        // Respond with the new user
        return res.status(201).json(newUser);
    } catch (error) {
        console.error("Error adding user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// PATCH route to update user role
app.patch("/users/:id/role", async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    // Check if the role is valid
    const validRoles = ["admin", "full", "limited", "none"];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
    }

    try {
        // Find the user by ID
        const user = await db.User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update the user's role
        user.role = role;
        await user.save();

        // Respond with success
        return res
            .status(200)
            .json({ message: "User role updated successfully" });
    } catch (error) {
        console.error("Error updating user role:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// DELETE route to delete a user
app.delete("/users/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const user = await db.User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await user.destroy(); // Delete user
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

app.get("/project", async (req, res) => {
    const { companyId, projectId } = req.query;

    console.log("\n\ngetting project\n\n");

    try {
        const response = await axios.get(
            `https://api.procore.com/rest/v1.0/projects/${projectId}?company_id=${companyId}`,
            {
                headers: {
                    Authorization: `Bearer ${req.user.accessToken}`,
                    "Procore-Company-Id": companyId,
                },
            }
        );

        res.json(response.data);
    } catch (error) {
        console.log(error.response.status, error.response.data.message);

        res.status(error.response.status).json({
            message: error.response.data.message,
        });
    }
});

app.get("/direct_costs", async (req, res) => {
    const { companyId, projectId } = req.query;

    console.log("\n\ngetting direct costs\n\n");

    try {
        const response = await axios.get(
            `https://api.procore.com/rest/v1.0/projects/${projectId}/direct_costs/line_items`,
            {
                headers: {
                    Authorization: `Bearer ${req.user.accessToken}`,
                    "Procore-Company-Id": companyId,
                },
            }
        );

        res.json(response.data);
    } catch (error) {
        console.error("Error fetching direct costs from Procore:", error);
        res.status(500).json({ message: "Failed to fetch direct costs." });
    }
});

app.post("/delete_direct_cost", async (req, res) => {
    console.log("\n\ndeleting direct costs\n\n");
    console.log(req.body);
    console.log("\n\n");

    const { companyId, projectId, directCosts } = req.body;

    try {
        await axios.post(
            `https://api.procore.com/rest/v1.0/projects/${projectId}/direct_costs/bulk_delete`,
            {
                headers: {
                    Authorization: `Bearer ${req.user.accessToken}`,
                    "Procore-Company-Id": companyId,
                },
                body: JSON.stringify({
                    directCosts,
                }),
            }
        );

        res.status(200).json({
            message: "Direct cost items deleted successfully.",
        });
    } catch (error) {
        console.error("Error deleting direct costs:", error.status);
        res.status(500).json({
            message: "Failed to delete some or all direct cost items.",
        });
    }
});

app.delete("/external_data", async (req, res) => {
    const { companyId, item_type, item_ids } = req.body;

    try {
        await axios.delete(
            `https://api.procore.com/rest/v1.0/companies/${company_id}/external_data/bulk_destroy`,
            {
                headers: {
                    Authorization: `Bearer ${req.user.accessToken}`,
                    "Procore-Company-Id": companyId,
                },
                body: JSON.stringify({
                    item_type,
                    item_ids,
                }),
            }
        );
    } catch (error) {
        console.error("Error deleting direct cost:", error.status);
        res.status(500).json({
            message: "Failed to delete some or all external data.",
        });
    }
});

app.get("/logs", async (req, res) => {
    try {
        const logs = await db.Log.findAll({
            include: [
                {
                    model: db.User,
                    attributes: ["email"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json(logs);
    } catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).json({ message: "Failed to fetch logs." });
    }
});

app.post("/log", async (req, res) => {
    const { process, companyId, itemType, itemId, status, error } = req.body;

    try {
        await db.Log.create({
            user: req.user.id,
            process,
            companyId,
            itemType,
            itemId,
            status,
            error,
        });

        res.status(201).json({ message: "Process log created successfully" });
    } catch (error) {
        console.error("Error creating process log:", error);
        res.status(500).json({ message: "Failed to create process log" });
    }
});

// Start the backend server on port 3001
app.listen(3001, () => {
    console.log("Backend running on http://localhost:3001");
});
