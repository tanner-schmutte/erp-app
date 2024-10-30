import React, { useState } from "react";
import Banner from "../Elements/Banner";
import RunProcessModal from "../Elements/RunProcessModal";
import "../App.css";

export default function DeleteDirectCosts() {
    const [companyId, setCompanyId] = useState("");
    const [projectId, setProjectId] = useState("");
    const [isModalOpen, setModalOpen] = useState(false);
    const [isDeleting, setDeleting] = useState(false);
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

    // Fetch all direct costs for the project
    const fetchDirectCosts = async () => {
        try {
            const response = await fetch(
                `${
                    import.meta.env.VITE_BACKEND_URL
                }/direct_costs?companyId=${companyId}&projectId=${projectId}`,
                { credentials: "include" }
            );
            const data = await response.json();
            console.log("Fetched Direct Costs:", data);
            return data;
        } catch (error) {
            console.error("Error fetching direct costs:", error);
            return [];
        }
    };

    // Delete each direct cost item
    const deleteDirectCosts = async (directCosts) => {
        setDeleting(true);
        setProgress(0);

        const totalItems = directCosts.length;
        let completed = 0;

        console.log("Company ID:", companyId);
        console.log("we should be deleting", directCosts);

        try {
            for (const directCost of directCosts) {
                await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/delete_direct_cost`,
                    {
                        credentials: "include",
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            companyId,
                            projectId,
                            directCostId: directCost.id,
                        }),
                    }
                );

                completed += 1;
                setProgress(((completed / totalItems) * 100).toFixed(0));
            }
        } catch (error) {
            console.error("Error deleting direct costs:", error);
            alert("Failed to delete some or all direct costs.");
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
        const fetchedDirectCosts = await fetchDirectCosts();
        await deleteDirectCosts(fetchedDirectCosts);
    };

    return (
        <>
            <Banner />
            <div className="content-container">
                <div className="menu">
                    <h2 className="menu-title">
                        Delete a Project's Direct Costs
                    </h2>
                    <div className="item-name">
                        <label>Company ID:</label>
                        <input
                            type="text"
                            value={companyId}
                            onChange={(e) => setCompanyId(e.target.value)}
                            placeholder="Enter Company ID"
                            className="menu-input"
                            disabled={isDeleting}
                        />
                    </div>
                    <div className="item-name">
                        <label>Project ID:</label>
                        <input
                            type="text"
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            placeholder="Enter Project ID"
                            className="menu-input"
                            disabled={isDeleting}
                        />
                    </div>
                    <div className="run-process-container">
                        <button
                            className="run-process-button"
                            onClick={handleOpenModal}
                            disabled={isDeleting || !companyId || !projectId}
                        >
                            Delete Direct Costs
                        </button>
                    </div>
                </div>

                {error && <div className="menu error">{error}</div>}

                {isDeleting && (
                    <div className="progress-bar-container">
                        <div
                            className="progress-bar"
                            style={{ width: `${progress}%` }}
                        >
                            {progress}%
                        </div>
                    </div>
                )}

                {progress == 100 && (
                    <a
                        href={`https://${
                            projectId.length === 15 ? "us02" : "app"
                        }.procore.com/${projectId}/project/direct_costs`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="completion-link"
                    >
                        {`https://${
                            projectId.length === 15 ? "us02" : "app"
                        }.procore.com/${projectId}/project/direct_costs`}
                    </a>
                )}

                <RunProcessModal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    onConfirm={runProcess}
                    process={`delete all direct costs`}
                    projectName={projectName}
                    companyName={companyName}
                />
            </div>
        </>
    );
}
