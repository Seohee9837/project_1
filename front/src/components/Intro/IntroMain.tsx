import React from "react";
import Logo from "../Common/Logo";
import SearchBar from "../Common/SearchBar";
import LetsGoButton from "../Common/LetsGoButton";

export default function IntroMain() {
  const [search, setSearch] = React.useState("");
  const handleLetsGo = (type: string) => {
    if (type === "opinion") window.location.href = "/opinion";
    else window.location.href = "/info";
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "60px",
      }}
    >
      <Logo />
      <div style={{ display: "flex", alignItems: "center", margin: "30px 0" }}>
        <LetsGoButton onSelect={handleLetsGo} />
        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onSearch={() => {}}
        />
      </div>
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
