import React, { useState } from "react";
import Banner from "../Elements/Banner";
import RunProcessModal from "../Elements/RunProcessModal";
import "../App.css";

export default function UnlinkBudgetChange() {
    const [companyId, setCompanyId] = useState("");
    const [projectId, setProjectId] = useState("");
    const [projectName, setProjectName] = useState("");
    const [budgetChangeId, setbudgetChangeId] = useState("");
    const [isModalOpen, setModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [completed, setCompleted] = useState(0);
    const [progress, setProgress] = useState(0);
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
    };

    // Unlink change order and line items
    const unlinkBudgetChange = async () => {
        const totalCalls = 3;

        try {
            // Unlink change order itself
            const unlink = await fetch(
                `${
                    import.meta.env.VITE_BACKEND_URL
                }/unlink_items?companyId=${companyId}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify([
                        {
                            item_id: budgetChangeId,
                            item_type: "budget_change",
                            origin_code: null,
                            origin_id: null,
                            origin_data: null,
                        },
                    ]),
                    credentials: "include",
                }
            );

            if (!unlink.ok) {
                throw new Error("Failed to unlink change order");
            }

            setCompleted((prev) => {
                const newCompleted = prev + 1;
                setProgress(((newCompleted / totalCalls) * 100).toFixed(0));
                return newCompleted;
            });

            let erpRequestDetails = await fetch(
                `${
                    import.meta.env.VITE_BACKEND_URL
                }/erp_request_details?companyId=${companyId}&itemId=${budgetChangeId}`,
                { credentials: "include" }
            );

            if (!erpRequestDetails.ok) {
                const errorData = await response.json();
                throw new Error(
                    `${response.status} ${
                        errorData.message || response.statusText
                    }`
                );
            }

            erpRequestDetails = await erpRequestDetails.json();

            let erpRequestDetailsId = erpRequestDetails[0].id;

            await fetch(
                `${
                    import.meta.env.VITE_BACKEND_URL
                }/erp_request_details_rejected`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        companyId,
                        erpRequestDetailsId,
                    }),
                    credentials: "include",
                }
            );

            setCompleted((prev) => {
                const newCompleted = prev + 1;
                setProgress(((newCompleted / totalCalls) * 100).toFixed(0));
                return newCompleted;
            });

            let erpTransactions = await fetch(
                `${
                    import.meta.env.VITE_BACKEND_URL
                }/erp_transactions?companyId=${companyId}&projectId=${projectId}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                }
            );

            erpTransactions = await erpTransactions.json();

            let budgetChange = await fetch(
                `${
                    import.meta.env.VITE_BACKEND_URL
                }/budget_change?companyId=${companyId}&projectId=${projectId}&budgetChangeId=${budgetChangeId}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                }
            );

            budgetChange = await budgetChange.json();

            let lineItems = budgetChange.data.adjustment_line_items;

            let lineItemIds = lineItems.map((lineItem) => lineItem.id);

            const matchingIds = erpTransactions
                .filter((transaction) =>
                    lineItemIds.includes(transaction.procore_transaction_id)
                )
                .map((transaction) => transaction.id);

            for (let transactionId of matchingIds) {
                await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/erp_transactions`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            companyId,
                            projectId,
                            transactionId,
                        }),
                        credentials: "include",
                    }
                );
            }

            setCompleted((prev) => {
                const newCompleted = prev + 1;
                setProgress(((newCompleted / totalCalls) * 100).toFixed(0));
                return newCompleted;
            });

            return true; // Indicate success
        } catch (error) {
            console.error("Error unlinking Budget Change:", error);
            setError(error.message);
            setIsProcessing(false);
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
                    process: "Unlink Budget Change",
                    companyId,
                    itemType: "Budget Change",
                    itemId: budgetChangeId,
                    status: status,
                    error: error,
                }),
            });
        } catch (error) {
            console.error("Error logging process:", error);
        }
    };

    // Open confirmation modal and fetch change order details
    const handleOpenModal = async () => {
        setError("");
        try {
            await fetchProject();
            setModalOpen(true);
        } catch (error) {
            setError(error.message); // Sets the error without opening modal
        }
    };

    const runProcess = async () => {
        setModalOpen(false);
        setError("");
        setIsProcessing(true);

        const result = await unlinkBudgetChange();

        // Check if the result is true (success) or an error message (failure)
        const success = result === true;
        const errorMessage = success ? "" : result;

        logProcess(success ? "success" : "failed", errorMessage);

        if (success) {
            setFinished(true);
        } else {
            setError(errorMessage);
        }
    };

    return (
        <>
            {console.log("Completed:", completed)}
            {console.log("Progress:", progress)}
            <Banner />
            <div className="content-container">
                <div className="menu">
                    <h2 className="menu-title">Unlink Budget Change</h2>
                    <div className="item-name center">
                        <label>Company ID:</label>
                        <input
                            type="text"
                            value={companyId}
                            onChange={(e) => setCompanyId(e.target.value)}
                            className="menu-input"
                            disabled={isProcessing}
                        />
                    </div>
                    <div className="item-name center">
                        <label>Project ID:</label>
                        <input
                            type="text"
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            className="menu-input"
                            disabled={isProcessing}
                        />
                    </div>
                    <div className="item-name center">
                        <label>Budget Change ID:</label>
                        <input
                            type="text"
                            value={budgetChangeId}
                            onChange={(e) => setbudgetChangeId(e.target.value)}
                            className="menu-input"
                            disabled={isProcessing}
                        />
                    </div>
                    <div className="run-process-container">
                        <button
                            className="run-process-button"
                            onClick={handleOpenModal}
                            disabled={
                                isProcessing ||
                                !companyId ||
                                !projectId ||
                                !budgetChangeId
                            }
                        >
                            Unlink Budget Change
                        </button>
                    </div>
                </div>
                {error && <div className="menu error">{error}</div>}

                {isProcessing && (
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
                        }.procore.com/companies/${companyId}/projects/${projectId}/tools/budget_changes/${budgetChangeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="completion-link"
                    >
                        {`https://${
                            projectId.length === 15 ? "us02" : "app"
                        }.procore.com/companies/${companyId}/projects/${projectId}/tools/budget_changes/${budgetChangeId}`}
                    </a>
                )}

                <RunProcessModal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    onConfirm={runProcess}
                    process={`unlink budget change`}
                    child={budgetChangeId}
                    parent={projectName}
                />
            </div>
        </>
    );
}
