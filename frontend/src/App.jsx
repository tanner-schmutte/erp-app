import React, { useState, useEffect } from "react";
import { FaGear } from "react-icons/fa6";
import "./App.css";

const Admin = ["tanner.schmutte@procore.com"];
const Integration_Implementation_Specialists = ["chas.vermillion@procore.com"];
const Integration_Support_Specialists = ["chairat.puengrod@procore.com"];

// Admin, Super, Individual or something like that

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/user`, {
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
        window.location.href = `${
            import.meta.env.VITE_BACKEND_URL
        }/auth/procore`;
    };

    const handleLogout = () => {
        fetch(`${import.meta.env.VITE_BACKEND_URL}/logout`, {
            method: "POST",
            credentials: "include",
        }).then(setUser(null));
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
