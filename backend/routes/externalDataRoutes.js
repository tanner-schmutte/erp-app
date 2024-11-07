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

module.exports = router;
