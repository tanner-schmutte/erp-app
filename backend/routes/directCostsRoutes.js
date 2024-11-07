const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/direct_costs", async (req, res) => {
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
        console.log(error.response.status, error.response.data.message);

        res.status(error.response.status).json({
            message: error.response.data.message,
        });
    }
});

router.post("/delete_direct_cost", async (req, res) => {
    console.log("\n\ndeleting direct costs\n\n");
    console.log(req.body);
    console.log("\n\n");

    const { companyId, projectId, ids } = req.body;

    try {
        const response = await fetch(
            `https://api.procore.com/rest/v1.0/projects/${projectId}/direct_costs/bulk_delete`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${req.user.accessToken}`,
                    "Content-Type": "application/json",
                    "Procore-Company-Id": companyId,
                },
                body: JSON.stringify({
                    ids,
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                `${response.status} ${errorData.message || response.statusText}`
            );
        }

        res.status(200).json({
            message: "Direct cost items deleted successfully.",
        });
    } catch (error) {
        console.error("Error deleting direct costs:", error);

        res.status(500).json({
            message: error.message || "Failed to delete direct costs.",
        });
    }
});

module.exports = router;
