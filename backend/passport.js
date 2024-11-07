const passport = require("passport");
const OAuth2Strategy = require("passport-oauth2");
const axios = require("axios");
const db = require("./models");
require("dotenv").config();

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

module.exports = passport;
