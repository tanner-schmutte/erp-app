import React, { useState, useEffect } from "react";
import Banner from "../Elements/Banner";
import "../App.css";

export default function GetLogs() {
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/logs`,
                    {
                        credentials: "include",
                    }
                );
                if (!response.ok) {
                    throw new Error(
                        `Error: ${response.status} ${response.statusText}`
                    );
                }
                const data = await response.json();
                setLogs(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchLogs();
    }, []);

    return (
        <>
            <Banner />
            <div className="content-container">
                <h2>Process Logs</h2>
                <table className="logs-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>User</th>
                            <th>Process</th>
                            <th>Company ID</th>
                            <th>Item Type</th>
                            <th>Item ID</th>
                            <th>Status</th>
                            <th>Error</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id}>
                                <td>
                                    {new Date(log.createdAt).toLocaleString()}
                                </td>
                                <td>{log.User?.email}</td>
                                <td>{log.process}</td>
                                <td>{log.companyId}</td>
                                <td>{log.itemType}</td>
                                <td>{log.itemId}</td>
                                <td>{log.status}</td>
                                <td>{log.error}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
