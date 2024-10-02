import React, { useState, useEffect } from "react";
import { FaGear, FaTrash } from "react-icons/fa6";
import "./App.css";

// Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Confirm Delete</h2>
                <p>Are you sure you want to delete this user?</p>
                <div className="modal-buttons">
                    <button onClick={onConfirm} className="confirm-button">
                        Yes
                    </button>
                    <button onClick={onClose} className="cancel-button">
                        No
                    </button>
                </div>
            </div>
        </div>
    );
};

function App() {
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
        event.preventDefault(); // Prevent form from refreshing the page
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
                setUsers([...users, addedUser]); // Add new user to the table
                setNewUser({ email: "", role: "none" }); // Reset the form
            } else {
                console.error("Error adding user:", response.statusText);
            }
        } catch (error) {
            console.error("Error adding user:", error);
        }
    };

    const handleDeleteUser = (userId) => {
        // Show the confirmation modal and store the user to delete
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

            setUsers(users.filter((user) => user.id !== userToDelete)); // Remove user from the list
            setModalOpen(false); // Close the modal
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    return (
        <>
            <div className="title">
                <div className="title-content">
                    <FaGear
                        style={{
                            color: "white",
                            fontSize: "36px",
                            paddingRight: "10px",
                        }}
                    />
                    ERP App
                </div>
                {user && (
                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                )}
            </div>
            <div className="content-container">
                {user ? (
                    <>
                        <div className="welcome">Welcome, {user.email}</div>
                        {user.role === "admin" && (
                            <>
                                <button
                                    class="friendly show"
                                    onClick={() => {
                                        setShowUsers(!showUsers);
                                        if (!showUsers) fetchUsers();
                                    }}
                                >
                                    {showUsers ? "Hide Users" : "Show Users"}
                                </button>

                                {showUsers && (
                                    <>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th></th>
                                                    <th>Email</th>
                                                    <th>Admin</th>
                                                    <th>Full Access</th>
                                                    <th>Limited Access</th>
                                                    <th>None</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map((user, index) => (
                                                    <tr key={user.id}>
                                                        <td>{index + 1}</td>
                                                        <td className="email-cell">
                                                            {user.email}
                                                            <div
                                                                className="delete-button"
                                                                onClick={() =>
                                                                    handleDeleteUser(
                                                                        user.id
                                                                    )
                                                                }
                                                            >
                                                                <FaTrash />
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    user.role ===
                                                                    "admin"
                                                                }
                                                                onChange={() =>
                                                                    handleRoleChange(
                                                                        user.id,
                                                                        "admin"
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    user.role ===
                                                                    "full"
                                                                }
                                                                onChange={() =>
                                                                    handleRoleChange(
                                                                        user.id,
                                                                        "full"
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    user.role ===
                                                                    "limited"
                                                                }
                                                                onChange={() =>
                                                                    handleRoleChange(
                                                                        user.id,
                                                                        "limited"
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    user.role ===
                                                                    "none"
                                                                }
                                                                onChange={() =>
                                                                    handleRoleChange(
                                                                        user.id,
                                                                        "none"
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        <form onSubmit={handleAddUser}>
                                            <h4>Add New User</h4>
                                            <input
                                                type="email"
                                                value={newUser.email}
                                                onChange={(e) =>
                                                    setNewUser({
                                                        ...newUser,
                                                        email: e.target.value,
                                                    })
                                                }
                                                placeholder="User email"
                                                required
                                            />
                                            <select
                                                value={newUser.role}
                                                onChange={(e) =>
                                                    setNewUser({
                                                        ...newUser,
                                                        role: e.target.value,
                                                    })
                                                }
                                            >
                                                <option value="admin">
                                                    Admin
                                                </option>
                                                <option value="full">
                                                    Full Access
                                                </option>
                                                <option value="limited">
                                                    Limited Access
                                                </option>
                                                <option value="none">
                                                    None
                                                </option>
                                            </select>
                                            <button
                                                type="submit"
                                                class="friendly submit"
                                            >
                                                Add User
                                            </button>
                                        </form>
                                    </>
                                )}
                            </>
                        )}
                        {roleOrder[user.role] < 4 && (
                            <div className="menu">
                                <h2>Process Menu</h2>
                                <div className="menu-item">
                                    <h3>
                                        1. &emsp; Delete a Project's Direct
                                        Costs
                                    </h3>
                                </div>
                                <div className="menu-item">
                                    <h3>2. &emsp; Sage 300: Unlink PCCOs</h3>
                                </div>
                                <div className="menu-item">
                                    <h3>3. &emsp; Sage 300: Update Sub Jobs</h3>
                                </div>
                                <div className="menu-item">
                                    <h3>4. &emsp; QBD: Sync Requisitions</h3>
                                </div>
                                <div className="menu-item">
                                    <h3>5. &emsp; Yardi: Update Origin Data</h3>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="login-container">
                        <button className="login-button" onClick={handleLogin}>
                            Login with Procore
                        </button>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={confirmDeleteUser}
            />
        </>
    );
}

export default App;
