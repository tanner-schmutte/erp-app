const express = require("express");
const router = express.Router();

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

// Update External Data
router.patch("/external_data", async (req, res) => {
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

module.exports = router;
