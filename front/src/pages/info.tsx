import React, { useState } from "react";
import SearchBar from "../components/Common/SearchBar";

export default function InfoPage() {
  const [searchValue, setSearchValue] = useState("");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchValue(e.target.value);
  const handleSearch = () => {
    // 검색 로직 구현 (예시)
    alert(`검색: ${searchValue}`);
  };
  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          width: "100vw",
          backgroundImage: 'url("/배경1.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "40px",
          textAlign: "center",
        }}
      >
        <SearchBar
          value={searchValue}
          onChange={handleChange}
          onSearch={handleSearch}
        />
        <h2>기업 정보 페이지 (예시)</h2>
        <p>여기서 주가 차트, 재무제표, ESG 등 구현</p>
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginTop: 24,
        }}
      >
        <img
          src="/커몽8.png"
          alt="커몽 로고"
          style={{ height: 80, marginLeft: 8 }}
        />
        <img
          src="/스탁커몬3.png"
          alt="Stokomon Inc 로고"
          style={{ height: 80, marginRight: 8 }}
        />
      </div>
    </>
  );
}
