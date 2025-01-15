const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/budget_change", async (req, res) => {
    console.log("\n\ngetting budget change\n\n");

    const { companyId, projectId, budgetChangeId } = req.query;

    console.log(req.query);

    try {
        const response = await axios.get(
            `https://api.procore.com/rest/v1.0/projects/${projectId}/budget_changes/${budgetChangeId}`,
            {
                headers: {
                    Authorization: `Bearer ${req.user.accessToken}`,
                    "Procore-Company-Id": companyId,
                },
            }
        );

        console.log(response);

        res.json(response.data);
    } catch (error) {
        console.log(error.response.status, error.response.data.message);

        res.status(error.response.status).json({
            message: error.response.data.message,
        });
    }
});

module.exports = router;
