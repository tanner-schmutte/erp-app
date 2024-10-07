import { useNavigate } from "react-router-dom";

import { FaGear, FaTrash } from "react-icons/fa6";
import "../App.css";

export default function HomepageContent({
    user,
    users,
    fetchUsers,
    handleLogin,
    handleLogout,
    handleAddUser,
    handleRoleChange,
    handleDeleteUser,
    setShowUsers,
    showUsers,
    newUser,
    setNewUser,
    roleOrder,
}) {
    const navigate = useNavigate();

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
                                    className="friendly show"
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
                                                className="friendly submit"
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
                                <h2 className="menu-title">Process Menu</h2>

                                <ol>
                                    <div
                                        className="menu-item"
                                        onClick={() =>
                                            navigate("/delete_direct_costs")
                                        }
                                    >
                                        <li className="item-name">
                                            Delete a Project's Direct Costs
                                        </li>
                                    </div>
                                    <div
                                        className={`menu-item ${
                                            roleOrder[user.role] > 2
                                                ? "disabled"
                                                : ""
                                        }`}
                                        onClick={() => {
                                            if (roleOrder[user.role] <= 2) {
                                                navigate("/unlink_pccos");
                                            }
                                        }}
                                    >
                                        <li className="item-name">
                                            Sage 300: Unlink PCCOs
                                        </li>
                                    </div>
                                    <div
                                        className="menu-item"
                                        onClick={() =>
                                            navigate("/update_sub_jobs")
                                        }
                                    >
                                        <li className="item-name">
                                            Sage 300: Update Sub Jobs
                                        </li>
                                    </div>
                                    <div
                                        className="menu-item"
                                        onClick={() =>
                                            navigate("/sync_requisitions")
                                        }
                                    >
                                        <li className="item-name">
                                            QBD: Sync Requisitions
                                        </li>
                                    </div>
                                    <div
                                        className="menu-item"
                                        onClick={() =>
                                            navigate(
                                                "/update_project_origin_data"
                                            )
                                        }
                                    >
                                        <li className="item-name">
                                            Yardi: Update Project Origin Data
                                        </li>
                                    </div>
                                </ol>
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
        </>
    );
}
