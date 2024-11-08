import React, { useState } from "react";
import Banner from "../Elements/Banner";
import RunProcessModal from "../Elements/RunProcessModal";
import "../App.css";

export default function UpdateProjectOriginData() {
    const [companyId, setCompanyId] = useState("");
    const [projectId, setProjectId] = useState("");
    const [yardiPropertyId, setYardiPropertyId] = useState("");
    const [isModalOpen, setModalOpen] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [completed, setCompleted] = useState(0);
    const [progress, setProgress] = useState(0);
    const [projectName, setProjectName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [error, setError] = useState("");

    // Fetch project and company name
    const fetchProject = async () => {
        const response = await fetch(
            `${
                import.meta.env.VITE_BACKEND_URL
            }/project?companyId=${companyId}&projectId=${projectId}`,
            { credentials: "include" }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
                `${response.status} ${errorData.message || response.statusText}`
            );
        }

        const data = await response.json();
        setProjectName(data.name);
        setCompanyName(data.company.name);
    };

    // Update project origin data
    const updateProjectOriginData = async (totalCalls) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/external_data`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        companyId,
                        item_type: "project",
                        item_id: projectId,
                        origin_data: yardiPropertyId,
                    }),
                    credentials: "include",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Failed to update project origin data."
                );
            }

            setCompleted((prev) => {
                const newCompleted = prev + 1;
                setProgress(((newCompleted / totalCalls) * 100).toFixed(0));
                return newCompleted;
            });
            return true; // Return success
        } catch (error) {
            console.error("Error updating project origin data:", error);
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
                    process: "Update Project Origin Data",
                    companyId,
                    itemType: "Project",
                    itemId: projectId,
                    status: status,
                    error: error,
                }),
            });
        } catch (error) {
            console.error("Error logging process:", error);
        }
    };

    // Open confirmation modal and fetch project details
    const handleOpenModal = async () => {
        setError("");
        try {
            await fetchProject();
            setModalOpen(true); // Only opens if fetchProject succeeds
        } catch (error) {
            setError(error.message); // Sets the error without opening modal
        }
    };

    const runProcess = async () => {
        setModalOpen(false);
        setError("");

        const totalCalls = 1; // Only one update call in this case
        setIsUpdating(true);

        const result = await updateProjectOriginData(totalCalls);

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
                    <h2 className="menu-title">
                        Yardi: Update Project Origin Data
                    </h2>
                    <div className="item-name center">
                        <label>Company ID:</label>
                        <input
                            type="text"
                            value={companyId}
                            onChange={(e) => setCompanyId(e.target.value)}
                            placeholder="Enter Company ID"
                            className="menu-input"
                            disabled={isUpdating}
                        />
                    </div>
                    <div className="item-name center">
                        <label>Project ID:</label>
                        <input
                            type="text"
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            placeholder="Enter Project ID"
                            className="menu-input"
                            disabled={isUpdating}
                        />
                    </div>
                    <div className="item-name center">
                        <label>Yardi Property ID:</label>
                        <input
                            type="text"
                            value={yardiPropertyId}
                            onChange={(e) => setYardiPropertyId(e.target.value)}
                            placeholder="Enter Yardi Property ID"
                            className="menu-input"
                            disabled={isUpdating}
                        />
                    </div>
                    <div className="run-process-container">
                        <button
                            className="run-process-button"
                            onClick={handleOpenModal}
                            disabled={
                                isUpdating ||
                                !companyId ||
                                !projectId ||
                                !yardiPropertyId
                            }
                        >
                            Update Project Origin Data
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
                    process={`update project origin data`}
                    projectName={projectName}
                    companyName={companyName}
                />
            </div>
        </>
    );
}
