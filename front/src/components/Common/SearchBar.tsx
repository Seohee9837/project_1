import React from "react";

export default function SearchBar({ value, onChange, onSearch }: any) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <input
        type="text"
        placeholder="기업명 또는 티커를 입력해주세요"
        value={value}
        onChange={onChange}
        style={{
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          width: "300px",
        }}
      />
      <button
        onClick={onSearch}
        style={{
          marginLeft: "8px",
          padding: "10px",
          borderRadius: "8px",
          border: "none",
          background: "#2563eb",
          color: "#fff",
        }}
      >
        🔍
      </button>
    </div>
  );
}
