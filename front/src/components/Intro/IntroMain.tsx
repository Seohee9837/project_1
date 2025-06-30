import React, { useState } from "react";
import {
  FaHeart,
  FaSearch,
  FaChartLine,
  FaComments,
  FaChartBar,
} from "react-icons/fa";

export default function IntroMain() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const handleLetsGo = () => setShowModal(true);
  const handleSelect = (type: string) => {
    if (type === "opinion") window.location.href = "/opinion";
    else if (type === "info") window.location.href = "/info";
  };
  const handleSearch = () => {
    if (search.trim()) {
      // 실제 검색 동작 (예시: alert)
      alert(`검색: ${search}`);
      // 또는 window.location.href = `/search?q=${encodeURIComponent(search)}`;
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
      }}
    >
      {/* 모달 오버레이 */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.18)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 4px 24px rgba(0,0,0,0.13)",
              padding: "38px 36px 32px 36px",
              minWidth: 340,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontWeight: 800,
                fontSize: "1.22rem",
                marginBottom: 6,
                color: "#222",
                letterSpacing: "-1px",
              }}
            >
              어떤 정보를 보시겠어요?
            </div>
            <div
              style={{
                color: "#888",
                fontSize: "0.97rem",
                marginBottom: 24,
                fontWeight: 500,
              }}
            >
              원하는 정보를 선택해주세요
            </div>
            <button
              style={{
                width: 260,
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "13px 0",
                fontWeight: 700,
                fontSize: "1.08rem",
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(37,99,235,0.08)",
              }}
              onClick={() => handleSelect("opinion")}
            >
              <FaComments style={{ fontSize: 18 }} />
              여론 보기
            </button>
            <button
              style={{
                width: 260,
                background: "#444",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "13px 0",
                fontWeight: 700,
                fontSize: "1.08rem",
                marginBottom: 22,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: "pointer",
              }}
              onClick={() => handleSelect("info")}
            >
              <FaChartBar style={{ fontSize: 18 }} />
              정보 보기
            </button>
            <button
              style={{
                background: "none",
                border: "none",
                color: "#888",
                fontSize: "0.98rem",
                cursor: "pointer",
                fontWeight: 500,
                marginTop: 0,
                padding: 0,
              }}
              onClick={() => setShowModal(false)}
            >
              닫기
            </button>
          </div>
        </div>
      )}
      <div style={{ marginTop: 60, textAlign: "center" }}>
        <div
          style={{
            fontSize: "3.2rem",
            fontWeight: 800,
            letterSpacing: "-2px",
            marginBottom: 12,
          }}
        >
          커몽
        </div>
        <div style={{ fontSize: "1.15rem", color: "#444", marginBottom: 36 }}>
          주식 정보를 간편하게 찾아보세요
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            marginBottom: 40,
          }}
        >
          <button
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 20,
              padding: "0 18px",
              height: 44,
              fontWeight: 700,
              fontSize: "1.05rem",
              display: "flex",
              alignItems: "center",
              marginBottom: 0,
              cursor: "pointer",
            }}
            onClick={handleLetsGo}
          >
            <FaHeart style={{ marginRight: 6 }} />
            레쓰고
          </button>
          <div
            style={{
              position: "relative",
              width: 340,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <input
              type="text"
              placeholder="기업명 또는 티커를 입력해주세요"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                width: "100%",
                height: 44,
                borderRadius: 8,
                border: "1.5px solid #d0d4db",
                padding: "0 40px 0 14px",
                fontSize: "1.08rem",
                outline: "none",
              }}
            />
            <FaSearch
              onClick={handleSearch}
              style={{
                position: "absolute",
                right: 12,
                top: 12,
                color: search.trim() ? "#2563eb" : "#a0a4b0",
                fontSize: 20,
                cursor: "pointer",
                zIndex: 2,
              }}
            />
          </div>
        </div>
        <div
          style={{
            margin: "60px 0 0 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#f5f7fa",
              borderRadius: "50%",
              width: 80,
              height: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
            }}
          >
            <FaChartLine style={{ color: "#2563eb", fontSize: 38 }} />
          </div>
          <div style={{ fontSize: "1.08rem", color: "#444" }}>
            주식 정보를 쉽고 빠르게
          </div>
        </div>
      </div>
      <div
        style={{
          position: "fixed",
          right: 30,
          bottom: 20,
          color: "#b0b0b0",
          fontSize: "1rem",
        }}
      >
        StocKommon Inc.
      </div>
    </div>
  );
}
