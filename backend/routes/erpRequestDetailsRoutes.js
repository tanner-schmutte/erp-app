const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/erp_request_details", async (req, res) => {
    console.log("\n\ngetting erp request details\n\n");

    const { companyId, itemId } = req.query;

    try {
        const response = await axios.get(
            `https://api.procore.com/rest/v1.0/companies/${companyId}/erp_request_details?filters[item_id]=${itemId}`,
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

router.patch("/erp_request_details", async (req, res) => {
    const { companyId, requestDetailId } = req.body;

    try {
        const response = await fetch(
            `https://api.procore.com/rest/v1.0/companies/${companyId}/erp_request_details/${requestDetailId}`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${req.user.accessToken}`,
                    "Content-Type": "application/json",
                    "Procore-Company-Id": companyId,
                },
                body: JSON.stringify({
                    request_detail: {
                        status: "success",
                    },
                }),
            }
        );

        if (response.ok) {
            const json = await response.json();
            console.log(json);
            res.status(200).json({
                message: "ERP request detail updated successfully",
            });
        } else {
            throw new Error(
                `Failed to update ERP request detail: ${response.status} ${response.statusText}`
            );
        }
    } catch (error) {
        console.error("Error updating external data:", error);
        res.status(500).json({
            message: "Failed to update ERP request detail",
        });
    }
});
