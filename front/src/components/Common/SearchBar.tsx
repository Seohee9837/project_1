import React from "react";

export default function SearchBar({ value, onChange, onSearch }: any) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "56px",
        margin: "16px 0",
      }}
    >
      <input
        type="text"
        placeholder="다른 기업 검색하기"
        value={value}
        onChange={onChange}
        style={{
          width: "260px",
          height: "48px",
          borderRadius: "24px 0 0 24px",
          border: "2px solid #3182f6",
          padding: "0 20px",
          fontSize: "18px",
          outline: "none",
          background: "#fff",
          boxSizing: "border-box",
          textAlign: "center",
          transition: "border 0.2s",
        }}
      />
      <button
        onClick={onSearch}
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "0 24px 24px 0",
          border: "2px solid #3182f6",
          borderLeft: "none",
          background: "#fff url('/돋보기.png') no-repeat center center",
          backgroundSize: "60% 60%",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
          transition: "background 0.2s, border 0.2s",
        }}
        aria-label="검색"
      />
    </div>
  );
}
