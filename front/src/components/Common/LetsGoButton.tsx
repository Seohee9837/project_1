import React, { useState } from "react";

export default function LetsGoButton({ onSelect }: any) {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div style={{ position: "relative", marginRight: "10px" }}>
      <button
        style={{
          background: "#2563eb",
          color: "#fff",
          borderRadius: "50px",
          border: "none",
          padding: "10px 20px",
          fontSize: "1.1rem",
          cursor: "pointer",
        }}
        onClick={() => setShowPopup(!showPopup)}
      >
        💙 레쓰고
      </button>
      {showPopup && (
        <div
          style={{
            position: "absolute",
            top: "45px",
            left: 0,
            background: "#fff",
            border: "1px solid #2563eb",
            borderRadius: "10px",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <button
            style={{
              padding: "10px",
              border: "none",
              background: "none",
              cursor: "pointer",
            }}
            onClick={() => onSelect("opinion")}
          >
            여론 보기
          </button>
          <button
            style={{
              padding: "10px",
              border: "none",
              background: "none",
              cursor: "pointer",
            }}
            onClick={() => onSelect("info")}
          >
            정보 보기
          </button>
        </div>
      )}
    </div>
  );
}
