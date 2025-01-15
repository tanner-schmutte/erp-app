import React, { useState } from "react";
import Banner from "../Elements/Banner";
import RunProcessModal from "../Elements/RunProcessModal";
import "../App.css";

export default function UpdateSubJobs() {
    const [companyId, setCompanyId] = useState("");
    const [subJobId, setSubJobId] = useState("");
    const [erpRequestDetailsIds, setErpRequestDetailsIds] = useState("");
    const [isModalOpen, setModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [completed, setCompleted] = useState(0);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState("");

    // Fetch ERP request details
    const fetchERPRequestDetails = async () => {
        const response = await fetch(
            `${
                import.meta.env.VITE_BACKEND_URL
            }/erp_request_details?companyId=${companyId}&itemId=${subJobId}`,
            { credentials: "include" }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                `${response.status} ${errorData.message || response.statusText}`
            );
        }

        const data = await response.json();
        setErpRequestDetailsIds(data[0]);
    };

    // Update ERP request detail
    const updateERPRequestDetail = async (totalCalls) => {
        try {
            for (requestDetailId of erpRequestDetailsIds) {
                const response = await fetch(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/erp_request_details_success`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            companyId,
                            requestDetailId,
                        }),
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(
                        errorData.message || "Failed to update Sub Job."
                    );
                }

                setCompleted((prev) => {
                    const newCompleted = prev + 1;
                    setProgress(((newCompleted / totalCalls) * 100).toFixed(0));
                    return newCompleted;
                });
            }

            return true; // Return success
        } catch (error) {
            console.error("Error updating ERP request detail:", error);
            setError(error.message);
            setIsUpdating(false);
            return error.message; // Return error message as string
        }
    };

    const logProcess = async (status, error) => {
        try {
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/log`, {
                credentials: "include",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    process: "Update Sub Job",
                    companyId,
                    itemType: "ERP Request Detail",
                    itemId: subJobId,
                    status: status,
                    error: error,
                }),
            });
        } catch (error) {
            console.error("Error logging process:", error);
        }
    };

    // Open confirmation modal and fetch ERP request details
    const handleOpenModal = async () => {
        setError("");
        try {
            await fetchERPRequestDetails();
            setModalOpen(true); // Only opens if fetchERPRequestDetails succeeds
        } catch (error) {
            setError(error.message); // Sets the error without opening modal
        }
    };

    const runProcess = async () => {
        setModalOpen(false);
        setError("");
        setIsUpdating(true);

        const result = await updateERPRequestDetail(
            erpRequestDetailsIds.length
        );

        // Check if the result is true (success) or an error message (failure)
        const success = result === true;
        const errorMessage = success ? "" : result;

        logProcess(success ? "success" : "failed", errorMessage);
    };

    return (
        <>
            {console.log("Completed:", completed)}
            {console.log("Progress:", progress)}
            <Banner />
            <div className="content-container">
                <div className="menu">
                    <h2 className="menu-title">Sage 300: Update Sub Jobs</h2>
                    <div className="item-name center">
                        <label>Company ID:</label>
                        <input
                            type="text"
                            value={companyId}
                            onChange={(e) => setCompanyId(e.target.value)}
                            className="menu-input"
                            disabled={isUpdating}
                        />
                    </div>
                    <div className="item-name center">
                        <label>Sub Job ID:</label>
                        <input
                            type="text"
                            value={subJobId}
                            onChange={(e) => setSubJobId(e.target.value)}
                            className="menu-input"
                            disabled={isUpdating}
                        />
                    </div>
                    <div className="run-process-container">
                        <button
                            className="run-process-button"
                            onClick={handleOpenModal}
                            disabled={isUpdating || !companyId || !subJobId}
                        >
                            Update Sub Jobs
                        </button>
                    </div>
                </div>

                {error && <div className="menu error">{error}</div>}

                {isUpdating && (
                    <div className="progress-bar-container">
                        <div
                            className="progress-bar"
                            style={{ width: `${progress}%` }}
                        >
                            {progress}%
                        </div>
                    </div>
                )}

                <RunProcessModal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    onConfirm={runProcess}
                    process={`update sub job`}
                    child={subJobId}
                    parent={companyId}
                />
            </div>
        </>
    );
}
