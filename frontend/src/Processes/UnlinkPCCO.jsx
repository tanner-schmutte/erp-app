import React, { useState } from "react";
import Banner from "../Elements/Banner";
import RunProcessModal from "../Elements/RunProcessModal";
import "../App.css";

export default function UnlinkPCCO() {
    const [companyId, setCompanyId] = useState("");
    const [projectId, setProjectId] = useState("");
    const [contractId, setContractId] = useState("");
    const [changeOrderId, setChangeOrderId] = useState("");
    const [isModalOpen, setModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [completed, setCompleted] = useState(0);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState("");

    // Fetch change order details
    const fetchChangeOrder = async () => {
        try {
            const response = await fetch(
                `${
                    import.meta.env.VITE_BACKEND_URL
                }/change_order?companyId=${companyId}&projectId=${projectId}&contractId=${contractId}&changeOrderId=${changeOrderId}`,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    `${response.status} ${
                        errorData.message || response.statusText
                    }`
                );
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error fetching change order:", error);
            setError(error.message);
            throw error;
        }
    };

    // Unlink change order and line items
    const unlinkChangeOrder = async (changeOrder) => {
        const totalCalls = changeOrder.line_items.length + 1;
        try {
            // Unlink change order itself
            const response = await fetch(
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
                            item_id: changeOrder.id,
                            item_type: "change_order",
                            origin_code: null,
                            origin_id: null,
                            origin_data: null,
                        },
                    ]),
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error("Failed to unlink change order");
            }

            setCompleted((prev) => {
                const newCompleted = prev + 1;
                setProgress(((newCompleted / totalCalls) * 100).toFixed(0));
                return newCompleted;
            });

            // Unlink line items
            const lineItemsBody = changeOrder.line_items.map((line_item) => ({
                item_id: line_item.id,
                item_type: "line_item",
                origin_code: null,
                origin_id: null,
                origin_data: null,
            }));

            const chunkArray = (array, size) => {
                const result = [];
                for (let i = 0; i < array.length; i += size) {
                    result.push(array.slice(i, i + size));
                }
                return result;
            };

            const batches = chunkArray(lineItemsBody, 100);

            for (const batch of batches) {
                const batchResponse = await fetch(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/unlink_items?companyId=${companyId}`,
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(batch),
                        credentials: "include",
                    }
                );

                if (!batchResponse.ok) {
                    throw new Error("Failed to unlink line items.");
                }

                setCompleted((prev) => {
                    const newCompleted = prev + 1;
                    setProgress(((newCompleted / totalCalls) * 100).toFixed(0));
                    return newCompleted;
                });
            }

            return true; // Indicate success
        } catch (error) {
            console.error("Error unlinking PCCO:", error);
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
                    process: "Unlink PCCO",
                    companyId,
                    itemType: "PCCO",
                    itemId: changeOrderId,
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
            await fetchChangeOrder();
            setModalOpen(true); // Only opens if fetchChangeOrder succeeds
        } catch (error) {
            setError(error.message); // Sets the error without opening modal
        }
    };

    const runProcess = async () => {
        setModalOpen(false);
        setError("");
        setIsProcessing(true);

        const changeOrder = await fetchChangeOrder();
        const result = await unlinkChangeOrder(changeOrder);

        // Check if the result is true (success) or an error message (failure)
        const success = result === true;
        const errorMessage = success ? "" : result;

        logProcess(success ? "success" : "failed", errorMessage);
        if (!success) {
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
                    <h2 className="menu-title">Sage 300: Unlink PCCO</h2>
                    <div className="item-name center">
                        <label>Company ID:</label>
                        <input
                            type="text"
                            value={companyId}
                            onChange={(e) => setCompanyId(e.target.value)}
                            placeholder="Enter Company ID"
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
                            placeholder="Enter Project ID"
                            className="menu-input"
                            disabled={isProcessing}
                        />
                    </div>
                    <div className="item-name center">
                        <label>Contract ID:</label>
                        <input
                            type="text"
                            value={contractId}
                            onChange={(e) => setContractId(e.target.value)}
                            placeholder="Enter Contract ID"
                            className="menu-input"
                            disabled={isProcessing}
                        />
                    </div>
                    <div className="item-name center">
                        <label>Change Order ID:</label>
                        <input
                            type="text"
                            value={changeOrderId}
                            onChange={(e) => setChangeOrderId(e.target.value)}
                            placeholder="Enter Change Order ID"
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
                                !contractId ||
                                !changeOrderId
                            }
                        >
                            Unlink PCCO
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

                <RunProcessModal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    onConfirm={runProcess}
                    process={`unlink PCCO`}
                    projectName={changeOrderId}
                    companyName={projectId}
                />
            </div>
        </>
    );
}
