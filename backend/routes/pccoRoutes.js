const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/change_order", async (req, res) => {
    console.log("\n\ngetting change order\n\n");

    const { companyId, projectId, contractId, changeOrderId } = req.query;

    console.log(companyId, projectId, contractId, changeOrderId);

    try {
        const response = await axios.get(
            `https://api.procore.com/rest/v1.0/change_order_packages/${changeOrderId}?project_id=${projectId}&contract_id=${contractId}`,
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
