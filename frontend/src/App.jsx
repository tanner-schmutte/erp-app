import React, { useState, useEffect } from "react";
import { FaGear } from "react-icons/fa6";
import "./App.css";

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch("http://localhost:3001/user", {
            credentials: "include",
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error("Not logged in");
            })
            .then((data) => {
                setUser(data);
            })
            .catch((error) => console.log(error));
    }, []);

    const handleLogin = () => {
        window.location.href = "http://localhost:3001/auth/procore"; // Redirect to backend
    };

    const handleLogout = async () => {
        window.location.href = "http://localhost:3001/logout";
    };

    return (
        <>
            <div className="title">
                <FaGear
                    style={{
                        color: "white",
                        fontSize: "36px",
                        paddingRight: "10px",
                    }}
                />
                ERP App
            </div>
            <div className="button-container">
                {user ? (
                    <>
                        <div className="welcome">Welcome, {user.login}</div>
                        <button className="auth-button" onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <button className="auth-button" onClick={handleLogin}>
                        Login with Procore
                    </button>
                )}
            </div>
        </>
    );
}

export default App;
