const express = require("express");
const db = require("../models");
const router = express.Router();

// Middleware to check if the user is an admin
function isAdmin(req, res, next) {
    if (req.user && req.user.role === "admin") {
        return next();
    } else {
        return res.status(403).json({ message: "Forbidden" });
    }
}

// Protected route to fetch user info
router.get("/user", (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(req.user); // Send user data to frontend
});

// Route to fetch all users (admin-only)
router.get("/users", isAdmin, async (req, res) => {
    try {
        const users = await db.User.findAll(); // Fetch all users
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
});

// POST route to add a new user
router.post("/users", isAdmin, async (req, res) => {
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
router.patch("/users/:id/role", isAdmin, async (req, res) => {
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
router.delete("/users/:id", isAdmin, async (req, res) => {
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

module.exports = router;
