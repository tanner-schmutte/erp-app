import React, { useState } from "react";
import Banner from "../Elements/Banner";
import RunProcessModal from "../Elements/RunProcessModal";
import "../App.css";

export default function DeleteDirectCosts() {
    const [companyId, setCompanyId] = useState("");
    const [projectId, setProjectId] = useState("");
    const [isModalOpen, setModalOpen] = useState(false);
    const [isDeleting, setDeleting] = useState(false);
    const [completed, setCompleted] = useState(0);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState("");
    const [projectName, setProjectName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [error, setError] = useState("");
    const [finished, setFinished] = useState(false);

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

    // Fetch all direct cost line items for the project
    const fetchDirectCostLineItems = async () => {
        try {
            const response = await fetch(
                `${
                    import.meta.env.VITE_BACKEND_URL
                }/direct_costs/line_items?companyId=${companyId}&projectId=${projectId}`,
                { credentials: "include" }
            );
            const data = await response.json();

            return data;
        } catch (error) {
            console.error("Error fetching direct cost line items:", error);
            setError(error.message);
        }
    };

    const fetchDirectCosts = async () => {
        try {
            const response = await fetch(
                `${
                    import.meta.env.VITE_BACKEND_URL
                }/direct_costs?companyId=${companyId}&projectId=${projectId}`,
                { credentials: "include" }
            );
            const data = await response.json();

            return data;
        } catch (error) {
            console.error("Error fetching direct costs:", error);
            setError(error.message);
        }
    };

    const chunkArray = (array, size) => {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    };

    const deleteExternalData = async (data, totalCalls, item_type) => {
        if (item_type === "line_item") {
            setMessage("Deleting Line Items External Data...");
        } else {
            setMessage("Deleting Direct Costs External Data...");
        }

        const ids = data.map((obj) => obj.id);

        const batches = chunkArray(ids, 100); // Split into batches of 100

        try {
            for (const batch of batches) {
                await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/external_data`,
                    {
                        credentials: "include",
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            companyId,
                            item_type,
                            item_ids: batch,
                        }),
                    }
                );
                setCompleted((prevCompleted) => {
                    const newCompleted = prevCompleted + 1;
                    setProgress(((newCompleted / totalCalls) * 100).toFixed(0));
                    return newCompleted;
                });
            }
        } catch (error) {
            console.error("Error deleting external data:", error);
            setError(error.message);
            logProcess("failed", error);
        }
    };

    // Delete each direct cost item
    const deleteDirectCosts = async (directCosts, totalCalls) => {
        setMessage("Deleting Direct Costs...");

        const ids = directCosts.map((directCost) => directCost.id);

        const batches = chunkArray(ids, 1000); // Split into batches of 1000

        try {
            for (const batch of batches) {
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
                            ids: batch,
                        }),
                    }
                );
            }

            setCompleted((prevCompleted) => {
                const newCompleted = prevCompleted + 1;
                setProgress(((newCompleted / totalCalls) * 100).toFixed(0));
                return newCompleted;
            });
        } catch (error) {
            console.error("Error deleting direct costs:", error);
            setError(error.message);
            logProcess("failed", error);
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
                    process: "Delete Direct Costs",
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
        setMessage("Fetching Direct Costs...");

        let loop = true;

        while (loop) {
            let lineItems = await fetchDirectCostLineItems();
            let directCosts = await fetchDirectCosts();

            if (directCosts.length < 10000) loop = false;

            setDeleting(true);

            await deleteExternalData(
                lineItems,
                Math.ceil(lineItems.length / 100),
                "line_item"
            );

            setMessage("");
            setProgress(0);
            setCompleted(0);

            await deleteExternalData(
                directCosts,
                Math.ceil(directCosts.length / 100),
                "item"
            );

            setMessage("");
            setProgress(0);
            setCompleted(0);

            await deleteDirectCosts(directCosts, 1);
        }

        setFinished(true);
        logProcess("success", "");
    };

    return (
        <>
            {console.log("Completed:", completed)}
            {console.log("Progress:", progress)}
            <Banner />
            <div className="content-container">
                <div className="menu">
                    <h2 className="menu-title">
                        Delete a Project's Direct Costs
                    </h2>
                    <div className="item-name center">
                        <label>Company ID:</label>
                        <input
                            type="text"
                            value={companyId}
                            onChange={(e) => setCompanyId(e.target.value)}
                            className="menu-input"
                            disabled={isDeleting}
                        />
                    </div>
                    <div className="item-name center">
                        <label>Project ID:</label>
                        <input
                            type="text"
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
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

                {message && <div className="message">{message}</div>}

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

                {finished && (
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
                    process={`delete all direct costs for`}
                    child={projectName}
                    parent={companyName}
                />
            </div>
        </>
    );
}
