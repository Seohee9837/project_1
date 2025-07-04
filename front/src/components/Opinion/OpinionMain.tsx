import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import {
  FaHome,
  FaExternalLinkAlt,
  FaHeart,
  FaComments,
  FaChartBar,
  FaSearch,
} from "react-icons/fa";
import "../../styles/opinion.css";
import { api } from "../../utils/api";
import type { ForumData, CurrentPriceData, Company } from "../../utils/api";

const COLORS = [
  "#1976d2",
  "#43a047",
  "#ffc658",
  "#ff8042",
  "#8dd1e1",
  "#a4de6c",
  "#d0ed57",
  "#d88884",
  "#b0b0b0",
  "#888888",
];

export default function OpinionMain() {
  const [showForumAll, setShowForumAll] = useState(false);
  const [showNewsAll, setShowNewsAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [forumData, setForumData] = useState<ForumData | null>(null);
  const [currentPriceData, setCurrentPriceData] = useState<CurrentPriceData | null>(null);
  const [loading, setLoading] = useState(true);

  // URL에서 종목코드 가져오기
  const stockCode = searchParams.get("code") || "000660";
  const [company, setCompany] = useState({
    corp_name: "SK하이닉스",
    ticker: stockCode,
  });

  // 백엔드에서 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [forumDataResult, priceDataResult] = await Promise.all([
          api.getForumData(stockCode),
          api.getCurrentPrice(stockCode)
        ]);
        
        if (forumDataResult) {
          setForumData(forumDataResult);
          setCompany({
            corp_name: forumDataResult.corpName || `종목코드 ${stockCode}`,
            ticker: stockCode,
          });
        }
        
        if (priceDataResult) {
          setCurrentPriceData(priceDataResult);
        }
      } catch (error) {
        console.error('데이터 로딩 오류:', error);
        setToastMsg('데이터를 불러오는데 실패했습니다.');
        setShowToast(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [stockCode]);

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) setSearchInput(code);
  }, [searchParams]);

  useEffect(() => {
    document.body.classList.add("body-opinion");
    return () => {
      document.body.classList.remove("body-opinion");
    };
  }, []);

  // 종목토론실 키워드 클릭 시 네이버 종토방 새 창
  const handleForumKeywordClick = (keyword: string) => {
    window.open(
      `https://finance.naver.com/item/board.naver?code=${
        company.ticker
      }&keyword=${encodeURIComponent(keyword)}&searchType=title`,
      "_blank"
    );
  };
  // 뉴스 키워드 클릭 시 네이버 뉴스에서 '기업명 + 키워드'가 함께 검색된 결과가 새 창으로 뜨도록 onClick을 수정
  const handleNewsKeywordClick = (keyword: string) => {
    window.open(
      `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(
        company.corp_name + " " + keyword
      )}`,
      "_blank"
    );
  };

  const handleLetsGo = () => setShowModal(true);
  const handleSelect = (type: string) => {
    if (type === "opinion") window.location.href = "/opinion";
    else if (type === "info") window.location.href = "/info";
  };

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
      if (searchInput.trim()) {
        handleSearch(searchInput);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // forums, news, trend 데이터는 forumData에서만 가져옴
  const forumKeywords = forumData?.forums || [];
  const newsKeywords = forumData?.news || [];
  const trendData = forumData?.trend || [];

  // 실제 데이터 사용
  const currentPrice = currentPriceData?.current_price || "데이터 로딩 중...";
  const yesterdayReturn = currentPriceData ? 
    `${currentPriceData.change} (${currentPriceData.change_rate})` : 
    "데이터 로딩 중...";
  const yesterdayScore = trendData.length > 0 ? trendData[trendData.length - 1].score : 0;
  const maxScore = 100;

  // 월이 바뀌는 첫 번째 date만 라벨로 표시하는 함수
  function monthTickFormatter(date: string, index: number): string {
    if (!date || !trendData || trendData.length === 0) return '';
    // YY.MM 포맷
    const label = date.slice(2, 4) + '.' + date.slice(5, 7);
    // 첫 데이터는 항상 표시
    if (index === 0) return label;
    // 이전 데이터와 월이 다르면 표시
    const prev = trendData[index - 1]?.date;
    if (prev && date.slice(0, 7) !== prev.slice(0, 7)) {
      return label;
    }
    return '';
  }

  if (loading) {
    return (
      <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, pointerEvents: 'none', background: 'transparent' }}>
        <img src="/loading.png" alt="로딩중" style={{ width: 640, display: 'block', background: 'transparent' }} />
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          background: 'rgba(255,255,255,0.6)',
          borderRadius: 32,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          padding: "40px 48px",
          maxWidth: "1400px",
          margin: "32px auto",
        }}
      >
        {/* 박스 내부 맨 위 중앙에 여론보기.png 이미지 */}
        <img
          src="/여론보기.png"
          alt="여론보기"
          style={{
            height: 140,
            display: "block",
            margin: "2px auto 24px auto",
          }}
        />
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
              <div style={{ display: 'flex', gap: 18, marginBottom: 18 }}>
                <button
                  onClick={async () => {
                    let value = searchInput.trim();
                    if (!/^[0-9A-Z]+$/.test(value)) {
                      const results = await api.searchCompany(value);
                      if (results && results.length > 0) {
                        value = results[0].ticker;
                      } else {
                        alert("해당 기업명을 찾을 수 없습니다.");
                        return;
                      }
                    }
                    navigate(`/opinion?code=${encodeURIComponent(value)}`);
                    setShowModal(false);
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
                  onClick={async () => {
                    let value = searchInput.trim();
                    if (!/^[0-9A-Z]+$/.test(value)) {
                      const results = await api.searchCompany(value);
                      if (results && results.length > 0) {
                        value = results[0].ticker;
                      } else {
                        alert("해당 기업명을 찾을 수 없습니다.");
                        return;
                      }
                    }
                    navigate(`/info?code=${encodeURIComponent(value)}`);
                    setShowModal(false);
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
                {selectedCompany?.corp_name}
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
                    if (selectedCompany) {
                      navigate(`/opinion?code=${encodeURIComponent(selectedCompany.ticker)}`);
                    }
                    setSelectedCompany(null);
                    setSearchInput("");
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
                    if (selectedCompany) {
                      navigate(`/info?code=${encodeURIComponent(selectedCompany.ticker)}`);
                    }
                    setSelectedCompany(null);
                    setSearchInput("");
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
                  setSearchInput("");
                }}
              >
                닫기
              </button>
            </div>
          </div>
        )}
        {/* info-summary-bar 구조로 상단 박스 통일 */}
        <div
          className="info-summary-bar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 36,
            gap: 24,
          }}
        >
          {/* 왼쪽 그룹: 회사명/티커 + 가격/등락률 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flex: 1,
              minWidth: 0,
            }}
          >
            <div className="info-title">
              <span className="company" style={{ fontFamily: 'yg-jalnan, sans-serif' }}>{company.corp_name}</span>
              <span className="code">{company.ticker}</span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                marginLeft: 16,
              }}
            >
              <span
                className="price"
                style={{
                  color: "#1e40af",
                  fontWeight: 800,
                  fontSize: "1.4rem",
                }}
              >
                ₩85,400
              </span>
              <span
                className="price-up"
                style={{
                  color: "#059669",
                  fontWeight: 700,
                  fontSize: "1.15rem",
                }}
              >
                +2,100 (+2.52%)
              </span>
            </div>
          </div>
          {/* 오른쪽 그룹: 검색바 + 버튼그룹 */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                position: "relative",
                width: 400,
                height: 52,
                background: "#fff",
                borderRadius: 18,
                boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
                display: "flex",
                alignItems: "center",
                padding: "0 18px",
                marginLeft: 0,
                margin: "0 auto 0 auto",
              }}
            >
              <input
                type="text"
                placeholder="기업명 or 종목 티커를 입력해 주세요"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchInput.trim()) {
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
              />
              {/* 자동완성 드롭다운 */}
              {searchResults.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: 52,
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
                      onClick={() => {
                        setSelectedCompany(company);
                        setSearchInput(company.ticker);
                        setSearchResults([]);
                      }}
                    >
                      <span style={{ fontWeight: 700 }}>{company.corp_name}</span>
                      <span style={{ color: '#1976d2', fontWeight: 700 }}>{company.ticker}</span>
                    </div>
                  ))}
                </div>
              )}
              <img
                src="/돋보기.png"
                alt="검색"
                width={32}
                height={32}
                onClick={() => {
                  if (!searchInput.trim()) return;
                  setShowModal(true);
                }}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: searchInput.trim() ? "pointer" : "not-allowed",
                  zIndex: 2,
                  opacity: searchInput.trim() ? 1 : 0.5,
                }}
              />
            </div>
            <div
              className="button-group"
              style={{
                display: "inline-block",
                background: "none",
                border: "none",
                boxShadow: "none",
                borderRadius: 0,
                padding: 0,
                margin: 0,
                verticalAlign: "middle",
                marginLeft: 24,
              }}
            >
              <button
                onClick={() =>
                  navigate(`/info?code=${encodeURIComponent(searchInput)}`)
                }
                aria-label="정보 보기"
                style={{
                  background: "none",
                  border: "none",
                  boxShadow: "none",
                  borderRadius: 0,
                  padding: 0,
                  margin: 0,
                  outline: "none",
                  display: "inline-block",
                  width: "auto",
                  height: "auto",
                  cursor: "pointer",
                  verticalAlign: "middle",
                  paddingRight: 20,
                }}
              >
                <img
                  src="/정보보기버튼.png"
                  alt="정보 보기"
                  style={{
                    display: "block",
                    width: "auto",
                    height: 64,
                    pointerEvents: "none",
                    background: "none",
                    border: "none",
                    boxShadow: "none",
                    borderRadius: 0,
                    margin: 0,
                    padding: 0,
                  }}
                />
              </button>
              <button
                onClick={() => navigate("/")}
                aria-label="홈"
                style={{
                  background: "none",
                  border: "none",
                  boxShadow: "none",
                  borderRadius: 0,
                  padding: 0,
                  margin: 0,
                  outline: "none",
                  display: "inline-block",
                  width: "auto",
                  height: "auto",
                  cursor: "pointer",
                  verticalAlign: "middle",
                }}
              >
                <img
                  src="/홈.png"
                  alt="홈"
                  style={{
                    display: "block",
                    width: "auto",
                    height: 57,
                    pointerEvents: "none",
                    background: "none",
                    border: "none",
                    boxShadow: "none",
                    borderRadius: 0,
                    margin: 0,
                    padding: 0,
                  }}
                />
              </button>
            </div>
          </div>
        </div>
        {/* 본문 2단 */}
        <div
          className="opinion-main-cards"
          style={{ display: "flex", gap: 24, marginBottom: 36 }}
        >
          {/* 종목토론실 */}
          <section
            className="opinion-card"
            style={{
              flex: "1 1 0",
              background: "#fff",
              borderRadius: 18,
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              padding: "32px 24px 18px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              minHeight: 420,
              overflow: "hidden",
            }}
          >
            <div
              className="card-title-row"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3><span style={{ fontFamily: 'yg-jalnan, sans-serif', fontSize: '1.5rem' }}>찐으로 많이 나온 단어들</span></h3>
              <a
                href={`https://finance.naver.com/item/board.naver?code=${company.ticker}`}
                target="_blank"
                rel="noopener noreferrer"
                className="card-icon"
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "1.35rem",
                  fontWeight: 700,
                  color: "#222",
                  gap: 8,
                  marginLeft: 10,
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                <img src="/종목토론실.png" alt="종목토론실" style={{ height: 40, width: "auto", display: "inline-block", verticalAlign: "middle" }} />
              </a>
            </div>
            {(!forumKeywords || forumKeywords.length === 0) ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                minHeight: 360,
                background: 'linear-gradient(90deg, #e3f0ff 0%, #f7faff 100%)',
                borderRadius: 16,
                margin: '32px 0',
              }}>
                <img src="/최신정보업데이트중.png" alt="최신 정보 업데이트 중" style={{ maxWidth: 250, width: '100%', height: 'auto', margin: '0 auto', display: 'block' }} />
              </div>
            ) : (
              <>
                <ol className="keyword-top-list" style={{ minHeight: 380 }}>
                  {(showForumAll ? forumKeywords : forumKeywords.slice(0, 10)).map(
                    (item, idx) => (
                      <li key={item.word} className="keyword-top-item">
                        <span className="rank-badge forum">{idx + 1}</span>
                        <span className="keyword-link">{item.word}</span>
                        <span className="keyword-count">
                          {item.count.toLocaleString()}회
                        </span>
                      </li>
                    )
                  )}
                </ol>
                {forumKeywords.length > 10 ? (
                  <button
                    className="more-btn"
                    onClick={() => setShowForumAll((v) => !v)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      margin: "14px auto 18px auto",
                      display: "block",
                      cursor: "pointer",
                      boxShadow: "none",
                    }}
                  >
                    <img
                      src={showForumAll ? "/닫기.png" : "/더보기.png"}
                      alt={showForumAll ? "닫기" : "더보기"}
                      style={{
                        height: 48,
                        width: "auto",
                        display: "block",
                        outline: "none",
                        border: "none",
                        boxShadow: "none",
                      }}
                    />
                  </button>
                ) : (
                  <div style={{ height: 62 }} />
                )}
                <div
                  className="bar-chart-area"
                  style={{ minHeight: 360, position: "relative", marginTop: 0 }}
                >
                  <div
                    style={{
                      fontSize: 15,
                      color: "#888",
                      fontWeight: 500,
                      marginBottom: 4,
                      textAlign: "left",
                    }}
                  >
                    키워드
                  </div>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={forumKeywords.slice(0, 10)}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                      barCategoryGap={4}
                    >
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis
                        dataKey="word"
                        type="category"
                        width={80}
                        interval={0}
                        tick={{ fontSize: 18 }}
                      />
                      <Tooltip formatter={(v: any) => `${v}회`} />
                      <Bar dataKey="count" fill="#ff9800">
                        {forumKeywords.slice(0, 10).map((entry, idx) => (
                          <Cell key={`cell-forum-${idx}`} fill="#ff9800" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div
                  className="bar-chart-label"
                  style={{ marginTop: 56, textAlign: "right" }}
                >
                  언급 횟수
                </div>
              </>
            )}
          </section>
          {/* 뉴스 */}
          <section
            className="opinion-card"
            style={{
              flex: "1 1 0",
              background: "#fff",
              borderRadius: 18,
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              padding: "32px 24px 18px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch",
              minHeight: 420,
              overflow: "hidden",
            }}
          >
            <div
              className="card-title-row"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h3><span style={{ fontFamily: 'yg-jalnan, sans-serif', fontSize: '1.5rem' }}>기자들이 자꾸 쓰는 단어들</span></h3>
              <a
                href={`https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(
                  company.corp_name
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="card-icon"
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "1.35rem",
                  fontWeight: 700,
                  color: "#222",
                  gap: 8,
                  marginLeft: 10,
                  textDecoration: "none",
                  cursor: "pointer",
                }}
              >
                <img src="/뉴스.png" alt="뉴스" style={{ height: 38, width: 70, display: "inline-block", verticalAlign: "middle" }} />
              </a>
            </div>
            {(!newsKeywords || newsKeywords.length === 0) ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                minHeight: 360,
                background: 'linear-gradient(90deg, #e3f0ff 0%, #f7faff 100%)',
                borderRadius: 16,
                margin: '32px 0',
              }}>
                <img src="/최신정보업데이트중.png" alt="최신 정보 업데이트 중" style={{ maxWidth: 250, width: '100%', height: 'auto', margin: '0 auto', display: 'block' }} />
              </div>
            ) : (
              <>
                <ol className="keyword-top-list" style={{ minHeight: 380 }}>
                  {(showNewsAll ? newsKeywords : newsKeywords.slice(0, 10)).map(
                    (item, idx) => (
                      <li
                        key={item.word}
                        className="keyword-top-item"
                        onClick={() =>
                          window.open(
                            `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(
                              company.corp_name + " " + item.word
                            )}`,
                            "_blank"
                          )
                        }
                      >
                        <span className="rank-badge news">{idx + 1}</span>
                        <span className="keyword-link news-link">
                          {item.word} <FaExternalLinkAlt size={12} />
                        </span>
                        <span className="keyword-count">
                          {item.count.toLocaleString()}회
                        </span>
                      </li>
                    )
                  )}
                </ol>
                {newsKeywords.length > 10 ? (
                  <button
                    className="more-btn"
                    onClick={() => setShowNewsAll((v) => !v)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      margin: "14px auto 18px auto",
                      display: "block",
                      cursor: "pointer",
                      boxShadow: "none",
                    }}
                  >
                    <img
                      src={showNewsAll ? "/닫기.png" : "/더보기.png"}
                      alt={showNewsAll ? "닫기" : "더보기"}
                      style={{
                        height: 48,
                        width: "auto",
                        display: "block",
                        outline: "none",
                        border: "none",
                        boxShadow: "none",
                      }}
                    />
                  </button>
                ) : (
                  <div style={{ height: 62 }} />
                )}
                <div
                  className="bar-chart-area"
                  style={{ minHeight: 360, position: "relative", marginTop: 0 }}
                >
                  <div
                    style={{
                      fontSize: 15,
                      color: "#888",
                      fontWeight: 500,
                      marginBottom: 4,
                      textAlign: "left",
                    }}
                  >
                    키워드
                  </div>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={newsKeywords.slice(0, 10)}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                      barCategoryGap={4}
                    >
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis
                        dataKey="word"
                        type="category"
                        width={80}
                        interval={0}
                        tick={{ fontSize: 18 }}
                      />
                      <Tooltip formatter={(v: any) => `${v}회`} />
                      <Bar dataKey="count" fill="#43a047">
                        {newsKeywords.slice(0, 10).map((entry, idx) => (
                          <Cell key={`cell-news-${idx}`} fill="#43a047" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div
                  className="bar-chart-label"
                  style={{ marginTop: 56, textAlign: "right" }}
                >
                  언급 횟수
                </div>
              </>
            )}
          </section>
        </div>
        {/* 하단 트렌드+어제 관심도 */}
        <div
          style={{
            background: "#fff",
            borderRadius: "18px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            padding: "48px 72px",
            maxWidth: "1200px",
            margin: "40px auto 0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ width: "100%", textAlign: "center", marginBottom: 12 }}>
            <span
              style={{
                fontWeight: 800,
                fontSize: "2rem",
                color: "#222",
                letterSpacing: "-1px",
                fontFamily: 'yg-jalnan, sans-serif',
                display: 'inline-block',
                marginTop: 15,
                marginBottom: 60,
              }}
            >
              어제 이 종목, 1년 중 얼마나 뜨거웠을까?
            </span>
          </div>
          <div
            style={{
              display: "flex",
              width: "100%",
              alignItems: "flex-start",
              justifyContent: "space-between",
              position: "relative",
              gap: 48,
            }}
          >
            <div
              className="trend-bottom-left"
              style={{
                flex: 2,
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <ResponsiveContainer width="100%" height={340}>
                <LineChart
                  data={trendData}
                  margin={{ top: 20, right: 40, left: 0, bottom: 56 }}
                >
                  <XAxis
                    dataKey="date"
                    tickCount={trendData.length}
                    tick={{ fontSize: 13, fontWeight: 600, fill: '#888' }}
                    axisLine={{ stroke: '#b0c4de' }}
                    tickLine={false}
                    height={60}
                    angle={-45}
                    textAnchor="end"
                    dy={12}
                  />
                  <YAxis
                    allowDecimals={false}
                    ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                    domain={[0, 100]}
                    tick={{ fontSize: 15, fontWeight: 700, fill: '#222' }}
                    axisLine={{ stroke: '#b0c4de' }}
                    tickLine={false}
                  />
                  <Tooltip formatter={(v: any) => `${v}점`} contentStyle={{ borderRadius: 12, background: '#f7faff', border: '1.5px solid #b0c4de', color: '#1976d2', fontWeight: 700 }} labelStyle={{ color: '#1976d2', fontWeight: 700 }} />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#1976d2"
                    strokeWidth={2}
                    dot={false}
                    activeDot={false}
                  />
                  <CartesianGrid strokeDasharray="6 6" stroke="#e3eaf7" />
                </LineChart>
              </ResponsiveContainer>
              {/* Y축 라벨 - Y축 선 바로 위, 가로 */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: -32,
                  fontSize: 15,
                  color: "#888",
                  fontWeight: 700,
                  letterSpacing: "-1px",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                  background: "#fff",
                  padding: "0 4px",
                  zIndex: 2,
                }}
              >
                관심도(점)
              </div>
            </div>
            <div
              className="trend-bottom-right"
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 120,
              }}
            >
              {/* 제목 */}
              <div
                style={{
                  fontSize: "1.13rem",
                  fontWeight: 700,
                  color: "#ff9800",
                  marginBottom: 8,
                  textAlign: "center",
                }}
              >
                관심 온도계, 어제는 몇 도?
              </div>
              {/* 조건부 체온계 SVG */}
              {yesterdayScore >= 50 ? (
                // 빨간 체온계 + 태양
                <svg width="90" height="170" viewBox="0 0 90 170">
                  {/* 태양 아이콘 */}
                  <g>
                    <circle
                      cx="45"
                      cy="22"
                      r="10"
                      fill="none"
                      stroke="#e53935"
                      strokeWidth="3"
                    />
                    {[...Array(8)].map((_, i) => (
                      <line
                        key={i}
                        x1={45 + 14 * Math.cos((i * Math.PI) / 4)}
                        y1={22 + 14 * Math.sin((i * Math.PI) / 4)}
                        x2={45 + 20 * Math.cos((i * Math.PI) / 4)}
                        y2={22 + 20 * Math.sin((i * Math.PI) / 4)}
                        stroke="#e53935"
                        strokeWidth="2"
                      />
                    ))}
                  </g>
                  {/* 체온계 본체 */}
                  <rect
                    x="30"
                    y="40"
                    width="30"
                    height="110"
                    rx="15"
                    fill="#fff"
                    stroke="#444"
                    strokeWidth="4"
                  />
                  {/* 눈금 */}
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <line
                      key={i}
                      x1="65"
                      x2="80"
                      y1={55 + i * 15}
                      y2={55 + i * 15}
                      stroke="#444"
                      strokeWidth="3"
                    />
                  ))}
                  {/* 빨간 막대 */}
                  <rect
                    x="43"
                    y={140 - (yesterdayScore / 100) * 90}
                    width="4"
                    height={(yesterdayScore / 100) * 90}
                    rx="2"
                    fill="#e53935"
                  />
                  {/* 하단 구슬 */}
                  <circle
                    cx="45"
                    cy="150"
                    r="15"
                    fill="#e53935"
                    stroke="#444"
                    strokeWidth="4"
                  />
                </svg>
              ) : (
                // 파란 체온계 + 눈송이
                <svg width="90" height="170" viewBox="0 0 90 170">
                  {/* 눈송이 아이콘 */}
                  <g>
                    <g stroke="#1976d2" strokeWidth="3">
                      <line x1="45" y1="10" x2="45" y2="32" />
                      <line x1="33" y1="16" x2="57" y2="26" />
                      <line x1="33" y1="26" x2="57" y2="16" />
                    </g>
                    <circle
                      cx="45"
                      cy="21"
                      r="7"
                      fill="none"
                      stroke="#1976d2"
                      strokeWidth="2"
                    />
                  </g>
                  {/* 체온계 본체 */}
                  <rect
                    x="30"
                    y="40"
                    width="30"
                    height="110"
                    rx="15"
                    fill="#fff"
                    stroke="#444"
                    strokeWidth="4"
                  />
                  {/* 눈금 */}
                  {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <line
                      key={i}
                      x1="65"
                      x2="80"
                      y1={55 + i * 15}
                      y2={55 + i * 15}
                      stroke="#444"
                      strokeWidth="3"
                    />
                  ))}
                  {/* 파란 막대 */}
                  <rect
                    x="43"
                    y={140 - (yesterdayScore / 100) * 90}
                    width="4"
                    height={(yesterdayScore / 100) * 90}
                    rx="2"
                    fill="#1976d2"
                  />
                  {/* 하단 구슬 */}
                  <circle
                    cx="45"
                    cy="150"
                    r="15"
                    fill="#1976d2"
                    stroke="#444"
                    strokeWidth="4"
                  />
                </svg>
              )}
              {/* 점수 */}
              <div
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  color: yesterdayScore >= 50 ? "#e53935" : "#1976d2",
                  marginTop: 4,
                }}
              >
                {yesterdayScore}°C
              </div>
            </div>
          </div>
        </div>
        {/* 토스트 안내 메시지 */}
        {showToast && (
          <div
            style={{
              position: "fixed",
              bottom: 32,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(40,40,40,0.97)",
              color: "#fff",
              padding: "14px 28px",
              borderRadius: 12,
              fontSize: "1.05rem",
              fontWeight: 600,
              zIndex: 9999,
              boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
            }}
          >
            {toastMsg}
          </div>
        )}
        {/* 블럭 하단에 커몽/스탁커몽 로고 배치 */}
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: 32,
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
      </div>
    </>
  );
}

/*
.custom-info-btn {
  position: relative;
  width: 260px;
  height: 104px;
  border: none;
  border-radius: 52px;
  background: linear-gradient(180deg, #3fdcff 0%, #1caaff 100%);
  box-shadow: 0 6px 24px #00bfff44, 0 2px 8px #0099ff22;
  color: #fff;
  font-size: 2.2rem;
  font-weight: 900;
  letter-spacing: -2px;
  text-shadow: 0 2px 0 #1caaff, 0 4px 12px #0099ff55;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: filter 0.15s, box-shadow 0.15s;
  overflow: visible;
}
.custom-info-btn:hover {
  filter: brightness(1.08);
  box-shadow: 0 8px 32px #00bfff66, 0 2px 8px #0099ff22;
}
.info-btn-icon {
  position: absolute;
  top: 12px; left: 36px;
  width: 32px; height: 32px;
  background: url('/별아이콘.svg') no-repeat center/contain;
}
.info-btn-bubble {
  position: absolute;
  top: 8px; right: 18px;
  width: 32px; height: 32px;
  background: url('/물방울.svg') no-repeat center/contain;
}
.info-btn-text {
  z-index: 1;
}
*/
