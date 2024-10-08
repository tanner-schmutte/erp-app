import React, { useState } from "react";
import Banner from "../Elements/Banner";
import ConfirmRunModal from "../Elements/ConfirmRunModal";
import "../App.css";

export default function DeleteDirectCosts() {
    const [companyId, setCompanyId] = useState("");
    const [projectId, setProjectId] = useState("");
    const [isModalOpen, setModalOpen] = useState(false);

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
                        />
                    </div>
                    <div className="run-process-container">
                        <button
                            className="run-process-button"
                            onClick={() => setModalOpen(true)}
                        >
                            Delete Direct Costs
                        </button>
                    </div>
                </div>
                <ConfirmRunModal
                    isOpen={isModalOpen}
                    onClose={() => setModalOpen(false)}
                    process="delete this project's direct costs"
                />
            </div>
        </>
    );
}
