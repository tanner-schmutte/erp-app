import React from "react";
import { FaGear } from "react-icons/fa6";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function Banner() {
    const navigate = useNavigate();

    return (
        <>
            <div className="title">
                <IoMdArrowRoundBack
                    style={{
                        color: "white",
                        fontSize: "36px",
                        paddingRight: "10px",
                        position: "absolute",
                        left: "30px",
                        cursor: "pointer",
                    }}
                    onClick={() => navigate("/")}
                />
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
            </div>
        </>
    );
}
