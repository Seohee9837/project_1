import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LetsGoButton() {
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [stockCode, setStockCode] = useState("");
  const navigate = useNavigate();

  const handleLetsGo = () => {
    if (selectedType) {
      // 이미 선택된 경우, 검색창이 있는 모달을 표시
      setShowModal(true);
    } else {
      // 처음 클릭한 경우, 타입 선택 모달을 표시
      setShowModal(true);
    }
  };

  const handleSelect = (type: string) => {
    setSelectedType(type);
    // 타입 선택 후 검색창이 있는 모달로 전환
  };

  const handleSearch = () => {
    if (selectedType && stockCode.trim()) {
      if (selectedType === "opinion") {
        navigate(`/opinion?code=${stockCode.trim()}`);
      } else if (selectedType === "info") {
        navigate(`/info?code=${stockCode.trim()}`);
      }
      setShowModal(false);
      setStockCode("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getButtonText = () => {
    if (selectedType === "opinion") return "여론 보기";
    if (selectedType === "info")
      return <img src="/정보보기.png" alt="정보 보기" style={{ height: 36 }} />;
    return "레쓰고!";
  };

  return (
    <>
      <button
        onClick={handleLetsGo}
        style={{
          background:
            selectedType === "info"
              ? "none"
              : selectedType
              ? "#2563eb"
              : "#ff6b35",
          border: "none",
          borderRadius: selectedType === "info" ? 52 : "50px",
          padding: selectedType === "info" ? 0 : "16px 32px",
          width: selectedType === "info" ? 260 : undefined,
          height: selectedType === "info" ? 104 : undefined,
          margin: selectedType === "info" ? 0 : undefined,
          boxShadow:
            selectedType === "info" ? "none" : "0 4px 15px rgba(0,0,0,0.2)",
          backgroundImage:
            selectedType === "info" ? "url('/정보보기.png')" : undefined,
          backgroundSize: selectedType === "info" ? "contain" : undefined,
          backgroundPosition: selectedType === "info" ? "center" : undefined,
          backgroundRepeat: selectedType === "info" ? "no-repeat" : undefined,
          cursor: "pointer",
          outline: "none",
          transition: "filter 0.15s",
          display: selectedType === "info" ? "flex" : "inline-block",
          alignItems: selectedType === "info" ? "center" : undefined,
          justifyContent: selectedType === "info" ? "center" : undefined,
        }}
        onMouseOver={
          selectedType === "info"
            ? (e) => (e.currentTarget.style.filter = "brightness(0.95)")
            : undefined
        }
        onMouseOut={
          selectedType === "info"
            ? (e) => (e.currentTarget.style.filter = "")
            : undefined
        }
        onFocus={
          selectedType === "info"
            ? (e) => (e.currentTarget.style.boxShadow = "0 0 0 2px #2563eb44")
            : undefined
        }
        onBlur={
          selectedType === "info"
            ? (e) => (e.currentTarget.style.boxShadow = "")
            : undefined
        }
        aria-label={selectedType === "info" ? "정보 보기" : undefined}
      >
        {selectedType === "info" ? (
          <span
            style={{
              opacity: 0,
              position: "absolute",
              pointerEvents: "none",
            }}
          >
            정보 보기
          </span>
        ) : (
          getButtonText()
        )}
      </button>

      {showModal && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
              padding: "40px",
              minWidth: "400px",
              textAlign: "center",
            }}
          >
            {!selectedType ? (
              // 타입 선택 모달
              <>
                <h2
                  style={{
                    marginBottom: "30px",
                    color: "#333",
                    fontSize: "1.5rem",
                  }}
                >
                  어떤 정보를 보시겠어요?
                </h2>
                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    justifyContent: "center",
                  }}
                >
                  <button
                    onClick={() => handleSelect("opinion")}
                    style={{
                      background: "#1976d2",
                      color: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      padding: "16px 24px",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "background 0.3s",
                    }}
                  >
                    여론 보기
                  </button>
                  <button
                    onClick={() => handleSelect("info")}
                    style={{
                      background: "#43a047",
                      color: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      padding: "16px 24px",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "background 0.3s",
                    }}
                  >
                    정보 보기
                  </button>
                </div>
              </>
            ) : (
              // 종목코드 입력 모달
              <>
                <h2
                  style={{
                    marginBottom: "20px",
                    color: "#333",
                    fontSize: "1.5rem",
                  }}
                >
                  {selectedType === "opinion" ? "여론 분석" : "기업 정보"} 보기
                </h2>
                <p
                  style={{
                    marginBottom: "30px",
                    color: "#666",
                    fontSize: "1rem",
                  }}
                >
                  종목코드를 입력해주세요
                </p>
                <div style={{ marginBottom: "30px" }}>
                  <input
                    type="text"
                    value={stockCode}
                    onChange={(e) => setStockCode(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="예: 005930 (삼성전자)"
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: "2px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "1rem",
                      outline: "none",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "15px",
                    justifyContent: "center",
                  }}
                >
                  <button
                    onClick={handleSearch}
                    disabled={!stockCode.trim()}
                    style={{
                      background: stockCode.trim() ? "#2563eb" : "#ccc",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px 24px",
                      fontSize: "1rem",
                      fontWeight: "600",
                      cursor: stockCode.trim() ? "pointer" : "not-allowed",
                    }}
                  >
                    검색
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedType(null);
                      setStockCode("");
                    }}
                    style={{
                      background: "#666",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      padding: "12px 24px",
                      fontSize: "1rem",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    취소
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
