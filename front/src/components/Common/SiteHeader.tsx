import React from "react";

export default function SiteHeader() {
  return (
    <header
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "18px 0 10px 0",
                        fontFamily: "yg-jalnan, sans-serif",
        fontWeight: 700,
        fontSize: "1.45rem",
        letterSpacing: "-1px",
        marginBottom: "18px",
      }}
    >
      <img
        src="/커몽8.png"
        alt="커몽 로고"
        style={{ height: 100, marginLeft: 8 }}
      />
      <img
        src="/스탁커몬3.png"
        alt="Stokomon Inc 로고"
        style={{ height: 100, marginRight: 8 }}
      />
    </header>
  );
}
