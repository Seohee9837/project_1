import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  Bar,
  AreaChart,
  Area,
  BarChart,
  ComposedChart,
  Legend,
  ReferenceDot,
  ReferenceLine,
} from "recharts";
import {
  FaHeart,
  FaHome,
  FaComments,
  FaChartBar,
  FaSearch,
} from "react-icons/fa";
import "../../styles/info.css";
import SiteHeader from "../Common/SiteHeader";
import { api } from "../../utils/api";
import type { DetailData, Company, CurrentPriceData } from "../../utils/api";

export default function InfoMain() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [detailData, setDetailData] = useState<DetailData | null>(null);
  const [currentPriceData, setCurrentPriceData] = useState<CurrentPriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const stockCode = searchParams.get("code") || "000660";
  const [company, setCompany] = useState({
    name: "SK하이닉스",
    ticker: stockCode,
  });
  const [showEsgTooltip, setShowEsgTooltip] = useState(false);

  // 데이터 fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [detail, price] = await Promise.all([
          api.getDetailData(stockCode),
          api.getCurrentPrice(stockCode)
        ]);
        if (detail) {
          setDetailData(detail);
          setCompany((prev) => ({
            ...prev,
            // financial_indicators.corp_name이 있으면 사용
            name: detail.financial_indicators?.corp_name || prev.name,
          }));
        }
        if (price) {
          setCurrentPriceData(price);
        }
      } catch (e) {
        // 에러 처리
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [stockCode]);

  // 검색 자동완성
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
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
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

  // 검색 결과 선택
  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company);
    setSearchInput(company.ticker);
    setSearchResults([]);
  };

  useEffect(() => {
    document.body.classList.add("body-info");
    return () => {
      document.body.classList.remove("body-info");
    };
  }, []);

  const handleLetsGo = () => setShowModal(true);
  const handleSelect = (type: string) => {
    if (type === "opinion") window.location.href = "/opinion";
    else if (type === "info") window.location.href = "/info";
  };
  // 과매수/골든크로스 구간 예시
  const overbought = true;
  const goldenCross = true;

  // 더미 데이터 제거 및 detailData, currentPriceData로 대체
  const priceChart = detailData?.price_chart || [];
  const indicatorChart = detailData?.indicator_chart || [];
  const financialIndicators = detailData?.financial_indicators || {};
  const esg = detailData?.esg || {};
  const reports = detailData?.reports || [];
  const financialStates = detailData?.financial_states || {};
  const revenueData = [
    { year: "2022", value: financialStates?.revenue_prev2 },
    { year: "2023", value: financialStates?.revenue_prev },
    { year: "2024", value: financialStates?.revenue },
  ];
  const opIncomeData = [
    { year: "2022", value: financialStates?.operating_income_prev2 },
    { year: "2023", value: financialStates?.operating_income_prev },
    { year: "2024", value: financialStates?.operating_income },
  ];
  const netIncomeData = [
    { year: "2022", value: financialStates?.net_income_prev2 },
    { year: "2023", value: financialStates?.net_income_prev },
    { year: "2024", value: financialStates?.net_income },
  ];

  // 현재 RSI 값 계산
  const currentRsi = indicatorChart.length > 0 ? indicatorChart[indicatorChart.length - 1].rsi : null;
  
  // financial_indicators에서 실제 필드명 사용
  const roe = financialIndicators?.ROE;
  const opm = financialIndicators?.["영업이익률"];
  const salesGrowth = financialIndicators?.["매출액증가율(YoY)"];
  const netIncomeGrowth = financialIndicators?.["영업이익증가율(YoY)"];
  const debtRatio = financialIndicators?.["부채비율"];
  const currentRatio = financialIndicators?.["유동비율"];

  // 골든/데드크로스 계산
  const crossPoints = [];
  for (let i = 1; i < indicatorChart.length; i++) {
    const prev = indicatorChart[i - 1];
    const curr = indicatorChart[i];
    if (prev.moving_20 <= prev.moving_60 && curr.moving_20 > curr.moving_60) {
      crossPoints.push({ ...curr, type: 'golden' });
    }
    if (prev.moving_20 >= prev.moving_60 && curr.moving_20 < curr.moving_60) {
      crossPoints.push({ ...curr, type: 'dead' });
    }
  }

  // RSI 상태 계산
  const lastRsi = indicatorChart.length > 0 ? indicatorChart[indicatorChart.length - 1].rsi : null;
  let rsiStatus = '';
  let rsiColor = '';
  if (lastRsi !== null) {
    if (lastRsi >= 70) {
      rsiStatus = '과매수';
      rsiColor = '#e53935';
    } else if (lastRsi <= 30) {
      rsiStatus = '과매도';
      rsiColor = '#43a047';
    } else {
      rsiStatus = '중립';
      rsiColor = '#1976d2';
    }
  }

  // 강조 키워드 스타일 함수
  function highlightMentions(line: string) {
    let result = line;
    result = result.replace(/상향 돌파/g, '<span style="color:#e53935;font-weight:700">상향 돌파</span>');
    result = result.replace(/과매수/g, '<span style="color:#e53935;font-weight:700">과매수</span>');
    result = result.replace(/과매도/g, '<span style="color:#43a047;font-weight:700">과매도</span>');
    result = result.replace(/골든크로스/g, '<span style="color:#43a047;font-weight:700">골든크로스</span>');
    result = result.replace(/데드크로스/g, '<span style="color:#e53935;font-weight:700">데드크로스</span>');
    // 날짜(YYYY-MM-DD 또는 YYYY-MM-DD 형식) badge 처리
    result = result.replace(/(\d{4}-\d{2}-\d{2})/g, '<span style="background:#f3f4f6;color:#222;border-radius:6px;padding:2px 8px;margin-left:4px;font-size:0.98em;font-weight:600">$1</span>');
    return result;
  }

  // multiples 데이터 추출
  const multiples = detailData?.multiples || {};
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return '-';
    return `${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`;
  };

  // 차트 툴크 포맷터 함수
  const chartTooltipFormatter = (value: any, name: any, props: any) => {
    // 거래량(Volume)
    if (name === '거래량' || name === 'Volume') {
      if (value >= 100000000) return [(value / 100000000).toFixed(2) + '억주', name];
      if (value >= 10000) return [(value / 10000).toFixed(2) + '만주', name];
      return [Number(value).toLocaleString() + '주', name];
    }
    // 가격(종가, 이평선 등)
    if (name.includes('종가') || name.includes('Close') || name.includes('이평선') || name === 'price') {
      return [Number(value).toLocaleString() + '원', name];
    }
    // RSI 등 기타
    return [Number(value).toLocaleString(), name];
  };

  // 억/조 단위 포맷터 (음수도 반영)
  const billionFormatter = (value: number) => {
    const abs = Math.abs(value);
    let str = '';
    if (abs >= 1e12) str = (abs / 1e12).toFixed(2) + '조';
    else if (abs >= 1e8) str = (abs / 1e8).toFixed(2) + '억';
    else str = abs.toLocaleString() + '원';
    return (value < 0 ? '-' : '') + str;
  };

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
        {/* 박스 내부 맨 위 중앙에 정보보기.png 이미지 */}
        <img
          src="/정보보기.png"
          alt="정보보기"
          style={{
            height: 135,
            width: 505,
            display: "block",
            margin: "8px auto 24px auto",
            maxWidth: "100%",
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
                    navigate(`/info?code=${encodeURIComponent(selectedCompany.ticker)}`);
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
        {/* 상단 요약 */}
        <div
          className="info-summary-bar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "38px auto 32px auto",
            borderRadius: 20,
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            padding: "24px 32px 24px 32px",
            minHeight: 64,
            gap: 32,
            fontSize: "1.3rem",
            maxWidth: 1400,
            width: "100%",
            boxSizing: "border-box",
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
            <div
              className="info-title"
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "flex-end",
                minWidth: 0,
                marginTop: "-6px",
              }}
            >
              <span
                className="company"
                style={{
                  fontWeight: 800,
                  fontSize: "1.8rem",
                  color: "#222",
                  letterSpacing: "-0.5px",
                  lineHeight: 1,
                }}
              >
                <span style={{ fontFamily: 'yg-jalnan, sans-serif' }}>{company.name}</span>
              </span>
              <span
                className="code"
                style={{
                  fontSize: "1.1rem",
                  color: "#888",
                  marginLeft: 4,
                  fontWeight: 600,
                  lineHeight: 1,
                  letterSpacing: "0.5px",
                }}
              >
                {company.ticker}
              </span>
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
                ₩{currentPriceData?.current_price || "85,400"}
              </span>
              <span
                className="price-up"
                style={{
                  color: "#059669",
                  fontWeight: 700,
                  fontSize: "1.15rem",
                }}
              >
                {currentPriceData ? `${currentPriceData.change} (${currentPriceData.change_rate})` : "+2,100 (+2.52%)"}
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
                      onClick={() => handleSelectCompany(company)}
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
                display: "flex",
                alignItems: "center",
                gap: 2,
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
                  navigate(`/opinion?code=${encodeURIComponent(searchInput || company.ticker)}`)
                }
                aria-label="여론 보기"
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
                  src="/여론보기버튼.png"
                  alt="여론 보기"
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
                className="btn-home"
                onClick={() => navigate("/")}
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

        {/* 1. 주가+거래량 차트 */}
        <div
          className="chart-section"
          style={{
            background: "#fff",
            borderRadius: 24,
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            padding: "36px 32px",
            margin: "0 auto 40px auto",
            maxWidth: 1400,
          }}
        >
          <div
            className="chart-header"
            style={{
              fontWeight: 800,
              fontSize: "1.7rem",
              marginBottom: 45,
              color: "#222",
              textAlign: "center",
            }}
          >
            <span style={{ fontFamily: 'yg-jalnan, sans-serif', fontSize: '1.6rem', display: 'block', textAlign: 'center' }}>주가 차트</span>
          </div>
          {/* 주가 차트 범례 */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 18,
              marginBottom: 8,
            }}
          >
            {/* 종가 범례 삭제됨 */}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={priceChart} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
              <XAxis dataKey="Date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={chartTooltipFormatter} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="Close" stroke="#1976d2" name="종가" dot={false} />
              <Bar yAxisId="right" dataKey="Volume" fill="#b0b0b0" name="거래량" barSize={8} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 2. 보조지표 차트 */}
        <div
          className="indicator-big-card"
          style={{
            background: "#fff",
            borderRadius: 24,
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            padding: "36px 32px",
            margin: "0 auto 40px auto",
            maxWidth: 1400,
          }}
        >
          <div
            className="indicator-title-row"
            style={{
              fontWeight: 800,
              fontSize: "1.7rem",
              marginBottom: 45,
              color: "#222",
              textAlign: "center",
            }}
          >
            <span style={{ fontFamily: 'yg-jalnan, sans-serif', fontSize: '1.6rem' }}>보조지표 차트</span>
          </div>
          {/* 보조지표 차트 범례 */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 12
          }}>
            {/* 윗줄: 이평선/종가 */}
            <div style={{
              display: 'flex', gap: 24, fontWeight: 700, fontSize: '1.08rem', fontFamily: 'yg-jalnan, sans-serif'
            }}>
              <span style={{ color: '#e53935', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="24" height="4"><line x1="0" y1="2" x2="24" y2="2" stroke="#e53935" strokeWidth="4" /></svg>
                20일 이평선
              </span>
              <span style={{ color: '#ff9800', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="24" height="4"><line x1="0" y1="2" x2="24" y2="2" stroke="#ff9800" strokeWidth="4" /></svg>
                60일 이평선
            </span>
              <span style={{ color: '#1976d2', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="24" height="4"><line x1="0" y1="2" x2="24" y2="2" stroke="#1976d2" strokeWidth="4" /></svg>
                종가
              </span>
            </div>
            {/* 아랫줄: 골든/데드크로스 */}
            <div style={{
              display: 'flex', gap: 24, marginTop: 6, fontWeight: 700, fontSize: '1.08rem', fontFamily: 'BagelFatOne-Regular, sans-serif'
            }}>
              <span style={{ color: '#43a047', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="18" height="18" style={{ verticalAlign: 'middle' }}>
                  <polygon points="9,3 16,15 2,15" fill="#43a047" />
                </svg>
                골든크로스
            </span>
              <span style={{ color: '#e53935', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="18" height="18" style={{ verticalAlign: 'middle' }}>
                  <polygon points="9,15 16,3 2,3" fill="#e53935" />
                </svg>
                데드크로스
            </span>
            </div>
          </div>
          <div className="indicator-chart-area" style={{ marginBottom: 32 }}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={indicatorChart} margin={{ top: 20, right: 30, left: 30, bottom: 20 }}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={chartTooltipFormatter} />
                <Line type="monotone" dataKey="price" stroke="#1976d2" name="종가" dot={false} />
                <Line type="monotone" dataKey="moving_20" stroke="#e53935" name="20일 이평선" dot={false} />
                <Line type="monotone" dataKey="moving_60" stroke="#ff9800" name="60일 이평선" dot={false} />
                {crossPoints.map((pt, idx) => (
                  <ReferenceDot
                    key={idx}
                    x={pt.date}
                    y={pt.type === 'golden' ? pt.moving_20 : pt.moving_60}
                    r={8}
                    fill={pt.type === 'golden' ? '#43a047' : '#e53935'}
                    stroke="#fff"
                    label={{
                      value: pt.type === 'golden' ? '▲' : '▼',
                      position: 'top',
                      fill: pt.type === 'golden' ? '#43a047' : '#e53935',
                      fontSize: 18,
                      fontFamily: 'BagelFatOne-Regular, sans-serif',
                    }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          {/* RSI 차트: 이평선 차트 바로 아래에 위치 */}
          <div className="rsi-chart-area" style={{ marginBottom: 32 }}>
            {/* RSI 값/상태 중앙 표시 */}
            <div style={{
              textAlign: 'center', fontWeight: 700, fontSize: '1.15rem', marginBottom: 4, fontFamily: 'yg-jalnan, sans-serif'
            }}>
              RSI <span style={{
                color: rsiColor, background: rsiColor + '22', borderRadius: 8, padding: '2px 10px', marginLeft: 4,
                fontWeight: 700, fontFamily: 'BagelFatOne-Regular, sans-serif'
              }}>
                {lastRsi?.toFixed(1)} ({rsiStatus})
              </span>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={indicatorChart} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={chartTooltipFormatter} />
                <Line type="monotone" dataKey="rsi" stroke="#1976d2" name="RSI" dot={false} />
                <ReferenceLine y={70} stroke="#e53935" strokeDasharray="3 3" label={{ value: '70', position: 'right', fill: '#e53935' }} />
                <ReferenceLine y={30} stroke="#43a047" strokeDasharray="3 3" label={{ value: '30', position: 'right', fill: '#43a047' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'stretch',
            gap: 32,
            margin: '32px 0'
          }}>
            <div style={{
              flex: 1,
              minWidth: 320,
              maxWidth: 480,
              background: 'rgba(240,244,248,0.85)',
              borderRadius: 20,
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              padding: '36px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* 이동평균선 멘트 */}
              <span className="indicator-title" style={{ color: '#1976d2', fontWeight: 700, fontSize: '1.18rem', fontFamily: 'yg-jalnan, sans-serif', marginBottom: 12 }}>이동평균선</span>
              <span className="indicator-desc" style={{ fontFamily: 'BagelFatOne-Regular, sans-serif', display: 'block' }}>
                {detailData?.indicators?.moving_avg
                  ? detailData.indicators.moving_avg.split(',').map((line: string, idx: number) =>
                    <div key={idx} style={{
                      textAlign: 'center',
                      fontWeight: idx === 0 ? 700 : 400,
                      fontSize: idx === 0 ? '1.13rem' : '1.01rem',
                      marginBottom: 2
                    }}
                      dangerouslySetInnerHTML={{ __html: highlightMentions(line.trim()) }}
                    />)
                  : '이동평균선 데이터 없음'}
              </span>
            </div>
            <div style={{
              flex: 1,
              minWidth: 320,
              maxWidth: 480,
              background: 'rgba(240,244,248,0.85)',
              borderRadius: 20,
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              padding: '36px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* RSI 멘트 */}
              <span className="indicator-title" style={{ color: '#1976d2', fontWeight: 700, fontSize: '1.18rem', fontFamily: 'yg-jalnan, sans-serif', marginBottom: 12 }}>RSI</span>
              <span className="indicator-desc" style={{ fontFamily: 'BagelFatOne-Regular, sans-serif', display: 'block' }}>
                {detailData?.indicators?.rsi
                  ? detailData.indicators.rsi.split(',').map((line: string, idx: number) =>
                    <div key={idx} style={{
                      textAlign: 'center',
                      fontWeight: idx === 0 ? 700 : 400,
                      fontSize: idx === 0 ? '1.13rem' : '1.01rem',
                      marginBottom: 2
                    }}
                      dangerouslySetInnerHTML={{ __html: highlightMentions(line.trim()) }}
                    />)
                  : 'RSI 데이터 없음'}
              </span>
            </div>
          </div>
        </div>

        {/* 보조지표 차트 아래, ESG 평가 위에 복구 */}
        <div
          className="fundamental-summary"
          style={{
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            padding: "40px 24px",
            maxWidth: "1400px",
            margin: "0 auto 40px auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            className="fundamental-title"
            style={{
              fontWeight: 700,
              fontSize: "1.4rem",
              textAlign: "center",
              marginBottom: 45,
              color: "#333",
            }}
          >
            <span style={{ fontFamily: 'yg-jalnan, sans-serif', fontSize: '1.6rem' }}>Fundametal Summary</span>
          </div>
          {/* 3개년 추이 그래프 영역 */}
          <div
            style={{
              display: "flex",
              gap: 32,
              width: "100%",
              justifyContent: "center",
              marginBottom: 32,
            }}
          >
            {/* 매출액 그래프 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ textAlign: "center", fontWeight: 600, marginBottom: 8 }}>매출액</div>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={revenueData}>
                  <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontFamily: 'BagelFatOne-Regular, sans-serif', fontSize: 13, fontWeight: 600 }} />
                  <YAxis hide />
                  <Tooltip formatter={billionFormatter} labelFormatter={label => `${label}년`} contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
                  <Bar dataKey="value" fill="#1976d2" radius={[8, 8, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ textAlign: 'center', marginTop: 18 }}>
                <span style={{ color: '#1976d2', fontWeight: 700, fontSize: '1.6rem', fontFamily: 'BagelFatOne-Regular, sans-serif' }}>
                  {financialStates?.revenue !== undefined && financialStates?.revenue !== null ? billionFormatter(financialStates.revenue) : '-'}
                </span>
              </div>
            </div>
            {/* 영업이익 그래프 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ textAlign: "center", fontWeight: 600, marginBottom: 8 }}>영업이익</div>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={opIncomeData}>
                  <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontFamily: 'BagelFatOne-Regular, sans-serif', fontSize: 13, fontWeight: 600 }} />
                  <YAxis hide />
                  <Tooltip formatter={billionFormatter} labelFormatter={label => `${label}년`} contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
                  <Bar dataKey="value" fill="#43a047" radius={[8, 8, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ textAlign: 'center', marginTop: 18 }}>
                <span style={{ color: '#43a047', fontWeight: 700, fontSize: '1.6rem', fontFamily: 'BagelFatOne-Regular, sans-serif' }}>
                  {financialStates?.operating_income !== undefined && financialStates?.operating_income !== null ? billionFormatter(financialStates.operating_income) : '-'}
                </span>
              </div>
            </div>
            {/* 당기순이익 그래프 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ textAlign: "center", fontWeight: 600, marginBottom: 8 }}>당기순이익</div>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={netIncomeData}>
                  <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontFamily: 'BagelFatOne-Regular, sans-serif', fontSize: 13, fontWeight: 600 }} />
                  <YAxis hide />
                  <Tooltip formatter={billionFormatter} labelFormatter={label => `${label}년`} contentStyle={{ background: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
                  <Bar dataKey="value" fill="#ff9800" radius={[8, 8, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ textAlign: 'center', marginTop: 18 }}>
                <span style={{ color: '#ff9800', fontWeight: 700, fontSize: '1.6rem', fontFamily: 'BagelFatOne-Regular, sans-serif' }}>
                  {financialStates?.net_income !== undefined && financialStates?.net_income !== null ? billionFormatter(financialStates.net_income) : '-'}
                </span>
              </div>
            </div>
          </div>
          {/* 수익성/성장성/안정성 카드 */}
          <div style={{ display: 'flex', gap: 10, width: '100%' }}>
            {/* 수익성 */}
            <div style={{ flex: 1, minWidth: 220, background: 'rgba(240,244,248,0.85)', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '18px 0', textAlign: 'center' }}>
              <div style={{ color: '#1a237e', fontWeight: 700, fontSize: '1.18rem', marginBottom: 16 }}>수익성</div>
              <div style={{ color: '#1976d2', fontWeight: 700, fontSize: '1.05rem' }}>ROE</div>
              <div style={{ fontWeight: 700, fontSize: '1.13rem', margin: '2px 0' }}>{financialIndicators?.ROE !== undefined && financialIndicators?.ROE !== null ? `${financialIndicators.ROE.toFixed(3)}%` : '-'}</div>
              <div style={{ fontSize: '0.98rem', color: '#888', marginBottom: 8 }}>({financialIndicators?.ROE_순위 ?? '-'}위, 하위 {financialIndicators?.['ROE_하위(%)'] ?? '-'}%)</div>
              <div style={{ color: '#1976d2', fontWeight: 700, fontSize: '1.05rem' }}>영업이익률</div>
              <div style={{ fontWeight: 700, fontSize: '1.13rem', margin: '2px 0' }}>{financialIndicators?.['영업이익률'] !== undefined && financialIndicators?.['영업이익률'] !== null ? `${financialIndicators['영업이익률'].toFixed(3)}%` : '-'}</div>
              <div style={{ fontSize: '0.98rem', color: '#888' }}>({financialIndicators?.['영업이익률_순위'] ?? '-'}위, 하위 {financialIndicators?.['영업이익률_하위(%)'] ?? '-'}%)</div>
            </div>
            {/* 성장성 */}
            <div style={{ flex: 1, minWidth: 220, background: 'rgba(240,244,248,0.85)', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '18px 0', textAlign: 'center' }}>
              <div style={{ color: '#1a237e', fontWeight: 700, fontSize: '1.18rem', marginBottom: 16 }}>성장성</div>
              <div style={{ color: '#1976d2', fontWeight: 700, fontSize: '1.05rem' }}>매출액증가율</div>
              <div style={{ fontWeight: 700, fontSize: '1.13rem', margin: '2px 0' }}>{financialIndicators?.['매출액증가율(YoY)'] !== undefined && financialIndicators?.['매출액증가율(YoY)'] !== null ? `${financialIndicators['매출액증가율(YoY)'].toFixed(3)}%` : '-'}</div>
              <div style={{ fontSize: '0.98rem', color: '#888', marginBottom: 8 }}>({financialIndicators?.['매출액증가율_순위'] ?? '-'}위, 하위 {financialIndicators?.['매출액증가율_하위(%)'] ?? '-'}%)</div>
              <div style={{ color: '#1976d2', fontWeight: 700, fontSize: '1.05rem' }}>영업이익증가율</div>
              <div style={{ fontWeight: 700, fontSize: '1.13rem', margin: '2px 0' }}>{financialIndicators?.['영업이익증가율(YoY)'] !== undefined && financialIndicators?.['영업이익증가율(YoY)'] !== null ? `${financialIndicators['영업이익증가율(YoY)'].toFixed(3)}%` : '-'}</div>
              <div style={{ fontSize: '0.98rem', color: '#888' }}>({financialIndicators?.['영업이익증가율_순위'] ?? '-'}위, 하위 {financialIndicators?.['영업이익증가율_하위(%)'] ?? '-'}%)</div>
              </div>
            {/* 안정성 */}
            <div style={{ flex: 1, minWidth: 220, background: 'rgba(240,244,248,0.85)', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '18px 0', textAlign: 'center' }}>
              <div style={{ color: '#1a237e', fontWeight: 700, fontSize: '1.18rem', marginBottom: 16 }}>안정성</div>
              <div style={{ color: '#1976d2', fontWeight: 700, fontSize: '1.05rem' }}>부채비율</div>
              <div style={{ fontWeight: 700, fontSize: '1.13rem', margin: '2px 0' }}>{financialIndicators?.['부채비율'] !== undefined && financialIndicators?.['부채비율'] !== null ? `${financialIndicators['부채비율'].toFixed(3)}%` : '-'}</div>
              <div style={{ fontSize: '0.98rem', color: '#888', marginBottom: 8 }}>({financialIndicators?.['부채비율_순위'] ?? '-'}위, 하위 {financialIndicators?.['부채비율_하위(%)'] ?? '-'}%)</div>
              <div style={{ color: '#1976d2', fontWeight: 700, fontSize: '1.05rem' }}>유동비율</div>
              <div style={{ fontWeight: 700, fontSize: '1.13rem', margin: '2px 0' }}>{financialIndicators?.['유동비율'] !== undefined && financialIndicators?.['유동비율'] !== null ? `${financialIndicators['유동비율'].toFixed(3)}%` : '-'}</div>
              <div style={{ fontSize: '0.98rem', color: '#888' }}>({financialIndicators?.['유동비율_순위'] ?? '-'}위, 하위 {financialIndicators?.['유동비율_하위(%)'] ?? '-'}%)</div>
              </div>
            </div>
          {/* 멀티플 카드 */}
          <div style={{ display: 'flex', gap: 10, width: '100%', justifyContent: 'space-between', margin: '24px 0 0 0' }}>
            {/* PER */}
            <div style={{ flex: 1, minWidth: 220, background: 'rgba(240,244,248,0.85)', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '18px 0', textAlign: 'center' }}>
              <div style={{ color: '#1976d2', fontWeight: 700, fontSize: '1.08rem' }}>PER</div>
              <div style={{ fontWeight: 700, fontSize: '1.18rem', margin: '4px 0' }}>{multiples.per !== undefined && multiples.per !== null ? multiples.per.toFixed(2) : '-'}</div>
              <div style={{ fontSize: '0.98rem', color: '#888' }}>EPS {multiples.eps !== undefined ? multiples.eps : '-'}</div>
              </div>
            {/* PBR */}
            <div style={{ flex: 1, minWidth: 220, background: 'rgba(240,244,248,0.85)', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '18px 0', textAlign: 'center' }}>
              <div style={{ color: '#1976d2', fontWeight: 700, fontSize: '1.08rem' }}>PBR</div>
              <div style={{ fontWeight: 700, fontSize: '1.18rem', margin: '4px 0' }}>{multiples.pbr !== undefined && multiples.pbr !== null ? multiples.pbr.toFixed(2) : '-'}</div>
              <div style={{ fontSize: '0.98rem', color: '#888' }}>BPS {multiples.bps !== undefined ? multiples.bps : '-'}</div>
              </div>
            {/* DIV */}
            <div style={{ flex: 1, minWidth: 220, background: 'rgba(240,244,248,0.85)', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '18px 0', textAlign: 'center' }}>
              <div style={{ color: '#1976d2', fontWeight: 700, fontSize: '1.08rem' }}>DIV</div>
              <div style={{ fontWeight: 700, fontSize: '1.18rem', margin: '4px 0' }}>{multiples.div !== undefined && multiples.div !== null ? multiples.div.toFixed(2) : '-'}</div>
              <div style={{ fontSize: '0.98rem', color: '#888' }}>DPS {multiples.dps !== undefined ? multiples.dps : '-'}</div>
            </div>
          </div>
          {/* 기준일 */}
          <div style={{ textAlign: 'center', color: '#888', fontSize: '0.98rem', marginTop: 8 }}>
            (기준일: {formatDate(multiples.date)})
        </div>
        </div>

        {/* 요약 재무지표 + ESG 평가 */}
        <div
          className="esg-summary"
          style={{
            background: "#fff",
            borderRadius: 20,
            boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
            padding: "40px 24px",
            maxWidth: "1400px",
            margin: "0 auto 24px auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            className="esg-title"
            style={{
              fontWeight: 700,
              fontSize: "1.4rem",
              textAlign: "center",
              marginBottom: 45,
              color: "#333",
              position: 'relative',
              display: 'inline-block',
            }}
            onMouseEnter={() => setShowEsgTooltip(true)}
            onMouseLeave={() => setShowEsgTooltip(false)}
          >
            <span style={{ fontFamily: 'yg-jalnan, sans-serif', fontSize: '1.6rem', cursor: 'pointer' }}>ESG 평가</span>
            {showEsgTooltip && (
              <div style={{
                position: 'absolute',
                left: 'calc(100% + 16px)',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#f5fafd',
                color: '#333',
                fontSize: '0.92rem',
                padding: '10px 16px',
                borderRadius: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                zIndex: 10,
                minWidth: 400,
                maxWidth: 600,
                textAlign: 'left',
                fontFamily: 'BagelFatOne-Regular, sans-serif',
                lineHeight: 1.7,
              }}>
                <b style={{color:'#1976d2', fontSize:'1.13rem'}}>'ESG'란?</b> 기업의 지속가능성을 평가하는 핵심 지표입니다.<br />
                <span style={{fontSize:'0.92rem'}}>
                  <b style={{color:'#1976d2'}}>E(Environment)</b>는 환경, <b style={{color:'#1976d2'}}>S(Social)</b>는 사회적 책임,<br />
                  <b style={{color:'#1976d2'}}>G(Governance)</b>는 지배구조를 의미합니다.
                </span>
              </div>
            )}
          </div>
          {/* ESG 총평(ESG 등급) 멘트 */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 48,
          }}>
            <div style={{
              background: '#e3f2fd',
              borderRadius: '50%',
              width: 90,
              height: 90,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <span style={{
                fontWeight: 800,
                fontSize: '2.1rem',
                color: '#1976d2',
                letterSpacing: '2px',
                fontFamily: 'BagelFatOne-Regular, sans-serif',
                textAlign: 'center',
              }}>{esg?.ESG ?? '-'}</span>
            </div>
          </div>
          <div
            className="esg-row"
            style={{ display: "flex", gap: 10, width: "100%" }}
          >
            <div className="esg-col" style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: '2rem', marginBottom: 4 }}>🌱</div>
              <div className="esg-grade" style={{ fontWeight: 700, fontSize: '1.6rem', color: '#1976d2' }}>{esg?.E ?? '-'}</div>
              <div className="esg-label" style={{ fontWeight: 800 }}>환경 (E)</div>
              <div className="esg-desc" style={{ fontFamily: 'BagelFatOne-Regular, sans-serif' }}>환경 친화적 경영 활동</div>
            </div>
            <div className="esg-col" style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: '2rem', marginBottom: 4 }}>🤝</div>
              <div className="esg-grade" style={{ fontWeight: 700, fontSize: '1.6rem', color: '#1976d2' }}>{esg?.S ?? '-'}</div>
              <div className="esg-label" style={{ fontWeight: 800 }}>사회 (S)</div>
              <div className="esg-desc" style={{ fontFamily: 'BagelFatOne-Regular, sans-serif' }}>사회적 가치 창출</div>
            </div>
            <div className="esg-col" style={{ flex: 1, textAlign: "center" }}>
              <div style={{ fontSize: '2rem', marginBottom: 4 }}>🏛️</div>
              <div className="esg-grade" style={{ fontWeight: 700, fontSize: '1.6rem', color: '#1976d2' }}>{esg?.G ?? '-'}</div>
              <div className="esg-label" style={{ fontWeight: 800 }}>지배구조 (G)</div>
              <div className="esg-desc" style={{ fontFamily: 'BagelFatOne-Regular, sans-serif' }}>투명한 지배구조</div>
            </div>
          </div>
        </div>
        {/* 리서치 PDF 목록 */}
        <div className="research-pdf-section" style={{ marginTop: 38 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 18,
              boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
              padding: "40px 24px",
              maxWidth: "1300px",
              margin: "0 auto",
            }}
          >
            <h2
              style={{
                fontSize: "1.4rem",
                fontWeight: 800,
                textAlign: "center",
                marginBottom: "45px",
              }}
            >
              <span style={{ fontFamily: 'yg-jalnan, sans-serif', fontSize: '1.6rem' }}>리서치 PDF</span>
            </h2>
            {reports.map((pdf: any, idx: number) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderBottom:
                    idx !== reports.length - 1
                      ? "1px solid #ececec"
                      : "none",
                  padding: "12px 0",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 500,
                      fontSize: "1.04rem",
                      marginBottom: 2,
                    }}
                  >
                    {pdf.제목}
                  </div>
                  <div style={{ color: "#888", fontSize: "0.97rem" }}>
                    {pdf.날짜} - {pdf.증권사}
                  </div>
                </div>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                  }}
                  onClick={() => window.open(pdf.PDF링크, "_blank")}
                >
                  <img
                    src="/다운로드.png"
                    alt="다운로드"
                    style={{
                      height: 40,
                      width: "auto",
                      display: "block",
                      outline: "none",
                      border: "none",
                      boxShadow: "none",
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
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
