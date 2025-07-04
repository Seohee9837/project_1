import React, { useState, useEffect } from "react";
import { FaSearch, FaChartLine, FaComments, FaChartBar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import type { Company } from "../../utils/api";

export default function IntroMain() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const navigate = useNavigate();

  // 검색 기능
  const handleSearch = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await api.searchCompany(query);
      setSearchResults(results);
    } catch (error) {
      console.error('검색 오류:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 검색어 변경 시 자동 검색
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search.trim()) {
        handleSearch(search);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [search]);

  // 종목코드/이름 입력 후 버튼 클릭 시 이동
  const handleGo = async (type: "opinion" | "info") => {
    if (!search.trim()) return;
    let ticker = search.trim();
    // 티커가 아닌 경우(한글 등)라면 검색 API로 변환
    if (!/^[0-9A-Z]+$/.test(ticker)) {
      try {
        const results = await api.searchCompany(ticker);
        if (results && results.length > 0) {
          ticker = results[0].ticker; // 첫 번째 결과의 티커 사용
        } else {
          alert("해당 기업명을 찾을 수 없습니다.");
          return;
        }
      } catch (e) {
        alert("검색 중 오류가 발생했습니다.");
        return;
      }
    }
    navigate(`/${type}?code=${encodeURIComponent(ticker)}`);
    setShowModal(false);
  };

  // Enter키나 검색 아이콘 클릭 시 모달 오픈
  const handleSearchPopup = () => {
    if (search.trim()) setShowModal(true);
  };

  // 검색 결과 선택
  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company);
    setSearch(company.ticker);
    setSearchResults([]);
  };

  useEffect(() => {
    document.body.classList.add("body-intro");
    return () => {
      document.body.classList.remove("body-intro");
    };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          marginTop: -120,
          textAlign: "center",
          background: "rgba(255,255,255,0.6)",
          borderRadius: 32,
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          padding: '75px 20px 12px 20px',
        }}
      >
        <div style={{ position: 'relative', width: '100%' }}>
          <img
            src="/커몽8.png"
            alt="커몽"
            style={{
              width: 600,
              marginBottom: 0,
              display: "block",
              margin: "0 auto",
            }}
          />
          {/* 소개문구 이미지: 커몽과 겹치게 */}
          <img
            src="/skygreen.png"
            alt="소개문구"
            style={{
              width: 220,
              position: 'absolute',
              left: '58%',
              transform: 'translateX(-50%) translateY(-850%)',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          />
        </div>
        <div style={{ height: 20 }} />
        <div style={{ marginBottom: 36 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
            }}
          >
            <div
              style={{
                position: "relative",
                width: 480,
                height: 50,
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 8px 32px #b0c4decc",
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                placeholder="기업명 or 종목 티커를 입력해 주세요"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && search.trim()) {
                    setShowModal(true);
                  }
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  width: "100%",
                  height: "100%",
                  fontFamily: "yg-jalnan, sans-serif",
                  fontSize: "1.25rem",
                  color: "#000000",
                  fontWeight: 500,
                  padding: "8px 16px 0 16px",
                  outline: "none",
                  textAlign: "center",
                  lineHeight: "32px",
                }}
                className="searchbar-input"
              />
              {/* 자동완성 드롭다운 */}
              {searchResults.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: 48,
                  left: 0,
                  width: '100%',
                  background: '#fff',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px #e9e9f3aa',
                  zIndex: 10,
                  maxHeight: 260,
                  overflowY: 'auto',
                }}>
                  {searchResults.map((company, idx) => (
                    <div
                      key={company.ticker}
                      style={{
                        padding: '12px 16px',
                        borderBottom: idx !== searchResults.length - 1 ? '1px solid #f0f0f0' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                      onClick={() => handleSelectCompany(company)}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    >
                      <span style={{ fontWeight: 600, fontSize: 15 }}>{company.corp_name}</span>
                      <span style={{ fontSize: 13, color: '#888', marginLeft: 12 }}>{company.ticker}</span>
                    </div>
                  ))}
                </div>
              )}
              <img
                src="/돋보기.png"
                alt="검색"
                width={32}
                height={32}
                onClick={handleSearchPopup}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: search.trim() ? "pointer" : "not-allowed",
                  zIndex: 2,
                  opacity: search.trim() ? 1 : 0.5,
                }}
              />
            </div>
            {search.trim() && (
              <div
                style={{
                  display: "flex",
                  gap: 0,
                  marginTop: 12,
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 0,
                  margin: 0,
                }}
              >
                <button
                  onClick={() => handleGo("opinion")}
                  style={{
                    width: 120,
                    height: 68,
                    background: "none",
                    border: "none",
                    padding: 0,
                    margin: 0,
                    borderRadius: 0,
                    boxShadow: "none",
                    backgroundImage: "url('/여론보기버튼.png')",
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    cursor: "pointer",
                    outline: "none",
                    transition: "filter 0.15s",
                    display: "block",
                    verticalAlign: "top",
                    boxSizing: "border-box",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.filter = "brightness(0.95)")
                  }
                  onMouseOut={(e) => (e.currentTarget.style.filter = "")}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = "0 0 0 2px #ffd60044")
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
                  aria-label="여론 보기"
                >
                  <span
                    style={{
                      opacity: 0,
                      position: "absolute",
                      pointerEvents: "none",
                    }}
                  >
                    여론 보기
                  </span>
                </button>
                <button
                  onClick={() => handleGo("info")}
                  style={{
                    width: 120,
                    height: 68,
                    background: "none",
                    border: "none",
                    padding: 0,
                    margin: 0,
                    borderRadius: 0,
                    boxShadow: "none",
                    backgroundImage: "url('/정보보기버튼.png')",
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    cursor: "pointer",
                    outline: "none",
                    transition: "filter 0.15s",
                    display: "block",
                    verticalAlign: "top",
                    boxSizing: "border-box",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.filter = "brightness(0.95)")
                  }
                  onMouseOut={(e) => (e.currentTarget.style.filter = "")}
                  onFocus={(e) =>
                    (e.currentTarget.style.boxShadow = "0 0 0 2px #ffd60044")
                  }
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "")}
                  aria-label="정보 보기"
                >
                  <span
                    style={{
                      opacity: 0,
                      position: "absolute",
                      pointerEvents: "none",
                    }}
                  >
                    정보 보기
                  </span>
                </button>
              </div>
            )}
            <img
              src="/스탁커몬3.png"
              alt="StocKommon Inc."
              style={{
                marginTop: 54,
                width: 220,
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            />
          </div>
        </div>
      </div>
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
            <div style={{ display: 'flex', gap: 18, marginBottom: 18 }}>
              <button
                onClick={() => handleGo("opinion")}
                style={{
                  width: 120,
                  height: 68,
                  background: "none",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  borderRadius: 0,
                  boxShadow: "none",
                  backgroundImage: "url('/여론보기버튼.png')",
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  cursor: "pointer",
                  outline: "none",
                  transition: "filter 0.15s",
                  display: "block",
                  verticalAlign: "top",
                  boxSizing: "border-box",
                }}
                aria-label="여론 보기"
              />
              <button
                onClick={() => handleGo("info")}
                style={{
                  width: 120,
                  height: 68,
                  background: "none",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  borderRadius: 0,
                  boxShadow: "none",
                  backgroundImage: "url('/정보보기버튼.png')",
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  cursor: "pointer",
                  outline: "none",
                  transition: "filter 0.15s",
                  display: "block",
                  verticalAlign: "top",
                  boxSizing: "border-box",
                }}
                aria-label="정보 보기"
              />
            </div>
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
      {/* 기업 선택 모달 */}
      {selectedCompany && (
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
              {selectedCompany.corp_name}
            </div>
            <div
              style={{
                color: "#888",
                fontSize: "0.97rem",
                marginBottom: 24,
                fontWeight: 500,
              }}
            >
              어떤 정보를 보시겠어요?
            </div>
            <div style={{ display: 'flex', gap: 18, marginBottom: 18 }}>
              <button
                onClick={() => {
                  navigate(`/opinion?code=${encodeURIComponent(selectedCompany.ticker)}`);
                  setSelectedCompany(null);
                  setSearch("");
                }}
                style={{
                  width: 120,
                  height: 68,
                  background: "none",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  borderRadius: 0,
                  boxShadow: "none",
                  backgroundImage: "url('/여론보기버튼.png')",
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  cursor: "pointer",
                  outline: "none",
                  transition: "filter 0.15s",
                  display: "block",
                  verticalAlign: "top",
                  boxSizing: "border-box",
                }}
                aria-label="여론 보기"
              />
              <button
                onClick={() => {
                  navigate(`/info?code=${encodeURIComponent(selectedCompany.ticker)}`);
                  setSelectedCompany(null);
                  setSearch("");
                }}
                style={{
                  width: 120,
                  height: 68,
                  background: "none",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  borderRadius: 0,
                  boxShadow: "none",
                  backgroundImage: "url('/정보보기버튼.png')",
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  cursor: "pointer",
                  outline: "none",
                  transition: "filter 0.15s",
                  display: "block",
                  verticalAlign: "top",
                  boxSizing: "border-box",
                }}
                aria-label="정보 보기"
              />
            </div>
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
              onClick={() => {
                setSelectedCompany(null);
                setSearch("");
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
