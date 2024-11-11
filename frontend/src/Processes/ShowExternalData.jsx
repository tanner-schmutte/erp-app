import React, { useState } from "react";
import Banner from "../Elements/Banner";
import "../App.css";

export default function ShowExternalData() {
    const [companyId, setCompanyId] = useState("");
    const [itemId, setItemId] = useState("");
    const [itemType, setItemType] = useState("project");
    const [externalData, setExternalData] = useState(null);
    const [error, setError] = useState("");

    const handleFetchData = async () => {
        setError("");
        setExternalData("");
        try {
            const response = await fetch(
                `${
                    import.meta.env.VITE_BACKEND_URL
                }/external_data?companyId=${companyId}&itemId=${itemId}&itemType=${itemType}`,
                { credentials: "include" }
            );
            if (!response.ok) {
                throw new Error("Failed to fetch external data.");
            }
            const data = await response.json();
            setExternalData(data);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <>
            <Banner />
            <div className="content-container">
                <div className="menu">
                    <h2 className="menu-title">Show External Data</h2>
                    <div className="item-name center">
                        <label>Company ID:</label>
                        <input
                            type="text"
                            value={companyId}
                            onChange={(e) => setCompanyId(e.target.value)}
                            placeholder="Enter Company ID"
                            className="menu-input"
                        />
                    </div>
                    <div className="item-name center">
                        <label>Item ID:</label>
                        <input
                            type="text"
                            value={itemId}
                            onChange={(e) => setItemId(e.target.value)}
                            placeholder="Enter Item ID"
                            className="menu-input"
                        />
                    </div>
                    <div className="item-name center">
                        <label>Item Type:</label>
                        <select
                            value={itemType}
                            onChange={(e) => setItemType(e.target.value)}
                            className="menu-input"
                        >
                            <option value="project">Project</option>
                            <option value="change_order">Change Order</option>
                            <option value="contract_payment">
                                Contract Payment
                            </option>
                            <option value="sub_job">Sub Job</option>
                            <option value="vendor">Vendor</option>
                        </select>
                    </div>
                    <div className="run-process-container">
                        <button
                            className="run-process-button"
                            onClick={handleFetchData}
                            disabled={!companyId || !itemId || !itemType}
                        >
                            Show External Data
                        </button>
                    </div>
                </div>

                {error && <div className="menu error">{error}</div>}

                {externalData && (
                    <div>
                        <h3>External Data:</h3>
                        <pre>{JSON.stringify(externalData, null, 2)}</pre>
                    </div>
                )}
            </div>
        </>
    );
}
