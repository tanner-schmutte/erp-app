const express = require("express");
const router = express.Router();
const axios = require("axios");

// Show External Data
router.get("/external_data", async (req, res) => {
    console.log("\n\ngetting erp request details\n\n");

    const { companyId, itemId, itemType } = req.query;

    console.log(req.query);

    try {
        const response = await axios.get(
            `https://api.procore.com/rest/v1.0/companies/${companyId}/external_data?item_type=${itemType}&item_id=${itemId}`,
            {
                headers: {
                    Authorization: `Bearer ${req.user.accessToken}`,
                    "Procore-Company-Id": companyId,
                },
            }
        );

        res.json(response.data);
    } catch (error) {
        console.log(error.response.status, error.response);

        res.status(error.response.status).json({
            message: error.response.data.message,
        });
    }
});

// Delete External Data
router.delete("/external_data", async (req, res) => {
    console.log("\n\ndeleting external data\n\n");
    console.log(req.body);
    console.log("\n\n");

    const { companyId, item_type, item_ids } = req.body;

    try {
        const response = await fetch(
            `https://api.procore.com/rest/v1.0/companies/${companyId}/external_data/bulk_destroy`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${req.user.accessToken}`,
                    "Content-Type": "application/json",
                    "Procore-Company-Id": companyId,
                },
                body: JSON.stringify({
                    item_type,
                    item_ids,
                }),
            }
        );

        if (!response.ok) {
            throw new Error(
                `Failed to delete external data: ${response.status} ${response.statusText}`
            );
        }

        res.status(204).send(); // No content
    } catch (error) {
        console.error("Error deleting external data:", error);
        res.status(500).json({ message: "Failed to delete external data" });
    }
});

// Update Origin Data
router.patch("/origin_data", async (req, res) => {
    const { companyId, item_type, item_id, origin_data } = req.body;

    const requestBody = {
        updates: [
            {
                item_type,
                item_id,
                origin_data,
            },
        ],
    };

    try {
        const response = await fetch(
            `https://api.procore.com/rest/v1.0/companies/${companyId}/external_data/sync`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${req.user.accessToken}`,
                    "Content-Type": "application/json",
                    "Procore-Company-Id": companyId,
                },
                body: JSON.stringify(requestBody),
            }
        );

        if (response.ok) {
            const json = await response.json();
            console.log(json);
            res.status(200).json({
                message: "External data updated successfully",
            });
        } else {
            throw new Error(
                `Failed to update external data: ${response.status} ${response.statusText}`
            );
        }
    } catch (error) {
        console.error("Error updating external data:", error);
        res.status(500).json({ message: "Failed to update external data" });
    }
});

// Unlink Item
router.patch("/unlink_items", async (req, res) => {
    try {
        const response = await fetch(
            `https://api.procore.com/rest/v1.0/companies/${companyId}/external_data/sync`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${req.user.accessToken}`,
                    "Content-Type": "application/json",
                    "Procore-Company-Id": companyId,
                },
                body: JSON.stringify({ updates: req.body }),
            }
        );

        if (response.ok) {
            const json = await response.json();
            console.log(json);
            res.status(200).json({
                message: "External data updated successfully",
            });
        } else {
            throw new Error(
                `Failed to update external data: ${response.status} ${response.statusText}`
            );
        }
    } catch (error) {
        console.error("Error updating external data:", error);
        res.status(500).json({ message: "Failed to update external data" });
    }
});

module.exports = router;
