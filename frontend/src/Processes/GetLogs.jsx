import React, { useState, useEffect } from "react";
import Banner from "../Elements/Banner";
import "../App.css";

export default function GetLogs() {
    const [logs, setLogs] = useState([]);

    // Filter criteria state
    const [userFilter, setUserFilter] = useState("");
    const [processFilter, setProcessFilter] = useState("");
    const [companyIdFilter, setCompanyIdFilter] = useState("");
    const [itemIdFilter, setItemIdFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [errorFilter, setErrorFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [filteredLogs, setFilteredLogs] = useState([]);

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
                setFilteredLogs(data); // Initialize filteredLogs with all data
            } catch (err) {
                console.error("Failed to fetch logs.");
            }
        };

        fetchLogs();
    }, []);

    // Filter logs based on criteria
    const handleFilter = () => {
        const filtered = logs.filter((log) => {
            const logDate = new Date(log.createdAt);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            const matchesDate =
                start && end
                    ? logDate >= start &&
                      logDate < new Date(end.setDate(end.getDate() + 1))
                    : start
                    ? logDate >= start
                    : end
                    ? logDate < new Date(end.setDate(end.getDate() + 1))
                    : true;
            const matchesUser = userFilter
                ? log.User?.email
                      .toLowerCase()
                      .includes(userFilter.toLowerCase())
                : true;
            const matchesProcess = processFilter
                ? log.process
                      .toLowerCase()
                      .includes(processFilter.toLowerCase())
                : true;
            const matchesCompanyId = companyIdFilter
                ? log.companyId.toString().includes(companyIdFilter)
                : true;
            const matchesItemId = itemIdFilter
                ? log.itemId.toString().includes(itemIdFilter)
                : true;
            const matchesStatus = statusFilter
                ? log.status.toLowerCase().includes(statusFilter.toLowerCase())
                : true;
            const matchesError = errorFilter
                ? log.error?.toLowerCase().includes(errorFilter.toLowerCase())
                : true;

            return (
                matchesDate &&
                matchesUser &&
                matchesProcess &&
                matchesCompanyId &&
                matchesItemId &&
                matchesStatus &&
                matchesError
            );
        });
        setFilteredLogs(filtered);
    };

    // Clear filters
    const handleClear = () => {
        setUserFilter("");
        setProcessFilter("");
        setCompanyIdFilter("");
        setItemIdFilter("");
        setStatusFilter("");
        setErrorFilter("");
        setStartDate("");
        setEndDate("");
        setFilteredLogs(logs); // Reset filtered logs to the full data set
    };

    return (
        <>
            <Banner />
            <div className="content-container">
                <h2>Process Logs</h2>

                {/* Filter Options */}
                <div className="filter-container">
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="User"
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Process"
                        value={processFilter}
                        onChange={(e) => setProcessFilter(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Company ID"
                        value={companyIdFilter}
                        onChange={(e) => setCompanyIdFilter(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Item ID"
                        value={itemIdFilter}
                        onChange={(e) => setItemIdFilter(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Error"
                        value={errorFilter}
                        onChange={(e) => setErrorFilter(e.target.value)}
                    />
                    <div>
                        <button
                            className="friendly submit"
                            onClick={handleFilter}
                            style={{ width: "90%" }}
                        >
                            Filter
                        </button>
                    </div>
                    <div>
                        <button
                            className="friendly submit"
                            onClick={handleClear}
                            style={{
                                width: "90%",
                                backgroundColor: "darkgray",
                            }}
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* Log Table */}
                <table className="logs-table">
                    <thead>
                        <tr>
                            <th></th>
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
                        {filteredLogs.map((log, index) => (
                            <tr key={log.id}>
                                <td>{index + 1}</td>
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
