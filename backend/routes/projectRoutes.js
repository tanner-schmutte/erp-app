const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/project", async (req, res) => {
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
        if (error.response) {
            res.status(error.response.status).json({
                message:
                    error.response.data?.message || "Unknown error occurred",
            });
        } else {
            // No response object, so it's likely a network or internal error
            res.status(500).json({
                message: error.message || "An unexpected error occurred",
            });
        }
    }
});

module.exports = router;
