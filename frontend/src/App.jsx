import React, { useState, useEffect } from "react";
import { FaGear } from "react-icons/fa6";
import "./App.css";

function App() {
    const [user, setUser] = useState(null);

    console.log(user);

    const fetchUser = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/user`,
                { credentials: "include" }
            );

            const data = await response.json();

            if (data.email) {
                setUser(data);
            } else {
                setUser(null); // If user is unauthorized, set user to null
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            setUser(null); // Handle error by clearing user state
        }
    };

    useEffect(() => {
        fetchUser(); // Fetch user data when component mounts
    }, []);

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

            console.log("logging out...");

            setUser(null);
        } catch (error) {
            console.error("Error during logout:", error);
        }
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
                        <div className="welcome">Welcome, {user.email}</div>
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
