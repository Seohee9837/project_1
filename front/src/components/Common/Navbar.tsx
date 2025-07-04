import React from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <nav
      style={{
        width: "100%",
        background: "#fff",
        boxShadow: "0 2px 12px #e9e9f3aa",
        padding: "0 32px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          fontWeight: 900,
          fontSize: 22,
          color: "#2563eb",
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        StocKommon
      </div>
      <div style={{ display: "flex", gap: 24 }}>
        <button style={navBtnStyle} onClick={() => navigate("/info")}>
          정보보기
        </button>
        <button style={navBtnStyle} onClick={() => navigate("/opinion")}>
          여론보기
        </button>
        <button style={navBtnStyle} onClick={() => navigate("/")}>
          홈
        </button>
      </div>
    </nav>
  );
}

const navBtnStyle = {
  background: "none",
  border: "none",
  color: "#2563eb",
  fontWeight: 700,
  fontSize: "1.08rem",
  cursor: "pointer",
  padding: "8px 18px",
  borderRadius: 9999,
  transition: "background 0.13s, color 0.13s",
} as React.CSSProperties;
