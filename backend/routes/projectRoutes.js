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
        console.log(error.response.status, error.response.data.message);

        res.status(error.response.status).json({
            message: error.response.data.message,
        });
    }
});

module.exports = router;
