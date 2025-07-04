import React, { useState } from "react";
import Logo from "../components/Common/Logo";
import SearchBar from "../components/Common/SearchBar";
import LetsGoButton from "../components/Common/LetsGoButton";

export default function IntroPage() {
  const [search, setSearch] = useState("");
  const handleLetsGo = (type: string) => {
    if (type === "opinion") window.location.href = "/opinion";
    else window.location.href = "/info";
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: 'url("/배경1.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "60px",
      }}
    >
      <Logo />
      <div
        style={{
          position: "fixed",
          right: "30px",
          bottom: "20px",
          color: "#b0b0b0",
          fontSize: "1rem",
        }}
      >
        StocKommon Inc.
      </div>
    </div>
  );
}
