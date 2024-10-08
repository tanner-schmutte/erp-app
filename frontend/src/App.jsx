import React, { useState, useEffect } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import "./App.css";

import HomepageContent from "./Elements/HomepageContent";
import ConfirmDeleteModal from "./Elements/ConfirmDeleteModal";

import DeleteDirectCosts from "./Processes/DeleteDirectCosts";
import UnlinkPCCOs from "./Processes/UnlinkPCCOs";
import UpdateSubJobs from "./Processes/UpdateSubJobs";
import SyncRequisitions from "./Processes/SyncRequisitions";
import UpdateProjectOriginData from "./Processes/UpdateProjectOriginData";

function ProtectedRoute({ user, roleOrder, requiredRole, children }) {
    // Check if the user is authenticated and has a valid role
    if (!user || roleOrder[user.role] > requiredRole) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default function App() {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [showUsers, setShowUsers] = useState(false);
    const [newUser, setNewUser] = useState({ email: "", role: "none" });
    const [isModalOpen, setModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const roleOrder = { admin: 1, full: 2, limited: 3, none: 4 };

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/user`,
                { credentials: "include" }
            );

            if (response.ok) {
                const data = await response.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            setUser(null);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/users`,
                {
                    credentials: "include",
                }
            );

            const data = await response.json();
            const sortedUsers = data.sort(
                (a, b) => roleOrder[a.role] - roleOrder[b.role]
            );
            setUsers(sortedUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleLogin = () => {
        window.location.href = `${
            import.meta.env.VITE_BACKEND_URL
        }/auth/procore`;
    };

    const handleLogout = async () => {
        try {
            await fetch(`${import.meta.env.VITE_BACKEND_URL}/logout`, {
                method: "POST",
                credentials: "include",
            });
            setUser(null);
            setUsers([]);
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/users/${userId}/role`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ role: newRole }),
                }
            );

            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.id === userId ? { ...user, role: newRole } : user
                )
            );
        } catch (error) {
            console.error("Error updating user role:", error);
        }
    };

    const handleAddUser = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/users`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newUser),
                }
            );

            if (response.ok) {
                const addedUser = await response.json();
                setUsers([...users, addedUser]);
                setNewUser({ email: "", role: "none" });
            } else {
                console.error("Error adding user:", response.statusText);
            }
        } catch (error) {
            console.error("Error adding user:", error);
        }
    };

    const handleDeleteUser = (userId) => {
        setUserToDelete(userId);
        setModalOpen(true);
    };

    const confirmDeleteUser = async () => {
        try {
            await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/users/${userToDelete}`,
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            setUsers(users.filter((user) => user.id !== userToDelete));
            setModalOpen(false);
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <HomepageContent
                            user={user}
                            users={users}
                            fetchUsers={fetchUsers}
                            handleLogin={handleLogin}
                            handleLogout={handleLogout}
                            handleAddUser={handleAddUser}
                            handleRoleChange={handleRoleChange}
                            handleDeleteUser={handleDeleteUser}
                            setShowUsers={setShowUsers}
                            showUsers={showUsers}
                            newUser={newUser}
                            setNewUser={setNewUser}
                            roleOrder={roleOrder}
                        />
                    }
                />
                <Route
                    path="/delete_direct_costs"
                    element={
                        <ProtectedRoute
                            user={user}
                            roleOrder={roleOrder}
                            requiredRole={3}
                        >
                            <DeleteDirectCosts />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/unlink_pccos"
                    element={
                        <ProtectedRoute
                            user={user}
                            roleOrder={roleOrder}
                            requiredRole={2}
                        >
                            <UnlinkPCCOs />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/update_sub_jobs"
                    element={
                        <ProtectedRoute
                            user={user}
                            roleOrder={roleOrder}
                            requiredRole={3}
                        >
                            <UpdateSubJobs />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/sync_requisitions"
                    element={
                        <ProtectedRoute
                            user={user}
                            roleOrder={roleOrder}
                            requiredRole={3}
                        >
                            <SyncRequisitions />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/update_project_origin_data"
                    element={
                        <ProtectedRoute
                            user={user}
                            roleOrder={roleOrder}
                            requiredRole={3}
                        >
                            <UpdateProjectOriginData />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ConfirmDeleteModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={confirmDeleteUser}
            />
        </Router>
    );
}
