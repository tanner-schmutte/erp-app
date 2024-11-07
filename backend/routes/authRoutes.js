const express = require("express");
const passport = require("passport");
const router = express.Router();

// OAuth 2.0 login route
router.get("/auth/procore", passport.authenticate("oauth2"));

// OAuth 2.0 callback route
router.get(
    "/auth/callback",
    passport.authenticate("oauth2", { failureRedirect: "/login" }),
    (req, res) => {
        console.log("Session data after login: \n\n", req.session); // Log session data here
        res.redirect(process.env.FRONTEND_URL);
    }
);

// Destroy session
router.post("/logout", (req, res) => {
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

module.exports = router;
