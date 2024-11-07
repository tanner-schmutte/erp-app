const express = require("express");
const db = require("../models");
const router = express.Router();

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); // User is authenticated, proceed to the next middleware/route handler
    } else {
        return res.status(401).json({ message: "Unauthorized" }); // User is not authenticated, send 401 response
    }
}

// Get logs
router.get("/logs", isLoggedIn, async (req, res) => {
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
        console.log(error.response.status, error.response.data.message);

        res.status(error.response.status).json({
            message: error.response.data.message,
        });
    }
});

// Create log
router.post("/log", async (req, res) => {
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

module.exports = router;
