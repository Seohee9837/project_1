import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "recharts";
import {
  FaHome,
  FaExternalLinkAlt,
  FaHeart,
  FaComments,
  FaChartBar,
} from "react-icons/fa";
import "../../styles/opinion.css";

// 예시 데이터
const forumKeywords = [
  { keyword: "반도체", count: 1247 },
  { keyword: "메모리", count: 892 },
  { keyword: "실적", count: 678 },
  { keyword: "상승", count: 534 },
  { keyword: "매수", count: 421 },
  { keyword: "ETF", count: 390 },
  { keyword: "공매도", count: 355 },
  { keyword: "성장", count: 312 },
  { keyword: "하락", count: 288 },
  { keyword: "주주", count: 250 },
  { keyword: "환율", count: 210 },
  { keyword: "공시", count: 180 },
  { keyword: "배당", count: 160 },
  { keyword: "분기보고서", count: 140 },
  { keyword: "인플레이션", count: 120 },
  { keyword: "실적발표", count: 110 },
  { keyword: "배터리소재", count: 90 },
  { keyword: "ESG", count: 80 },
  { keyword: "리스크", count: 70 },
  { keyword: "주가", count: 60 },
];
const newsKeywords = [
  { keyword: "투자", count: 324 },
  { keyword: "기술", count: 287 },
  { keyword: "성장", count: 213 },
  { keyword: "전망", count: 189 },
  { keyword: "시장", count: 156 },
  { keyword: "공매도", count: 140 },
  { keyword: "실적", count: 130 },
  { keyword: "환율", count: 120 },
  { keyword: "배당", count: 110 },
  { keyword: "공시", count: 100 },
  { keyword: "ETF", count: 90 },
  { keyword: "주가", count: 80 },
  { keyword: "배터리", count: 70 },
  { keyword: "ESG", count: 60 },
  { keyword: "리스크", count: 50 },
  { keyword: "분기보고서", count: 40 },
  { keyword: "실적발표", count: 30 },
  { keyword: "배터리소재", count: 20 },
  { keyword: "하락", count: 10 },
  { keyword: "주주", count: 5 },
];
const googleTrends = [
  { month: "1월", index: 25 },
  { month: "2월", index: 35 },
  { month: "3월", index: 48 },
  { month: "4월", index: 55 },
  { month: "5월", index: 38 },
  { month: "6월", index: 52 },
  { month: "7월", index: 60 },
  { month: "8월", index: 62 },
  { month: "9월", index: 58 },
  { month: "10월", index: 67 },
  { month: "11월", index: 54 },
  { month: "12월", index: 45 },
];
const yesterdayScore = 60;
const maxScore = 100;
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
  const company = { name: "하이닉스", ticker: "054930" };
  const navigate = useNavigate();

  // 종목토론실 키워드 클릭 시 네이버 종토방 새 창
  const handleForumKeywordClick = (keyword: string) => {
    window.open(
      `https://finance.naver.com/item/board.naver?code=${
        company.ticker
      }&keyword=${encodeURIComponent(keyword)}`,
      "_blank"
    );
  };
  // 뉴스 키워드 클릭 시 네이버 뉴스 새 창
  const handleNewsKeywordClick = (keyword: string) => {
    window.open(
      `https://search.naver.com/search.naver?where=news&query=${encodeURIComponent(
        keyword
      )}`,
      "_blank"
    );
  };

  const handleLetsGo = () => setShowModal(true);
  const handleSelect = (type: string) => {
    if (type === "opinion") window.location.href = "/opinion";
    else if (type === "info") window.location.href = "/info";
  };

  return (
    <div className="info-main-redesign">
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
              {" "}
              <FaComments style={{ fontSize: 18 }} /> 여론 보기
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
              {" "}
              <FaChartBar style={{ fontSize: 18 }} /> 정보 보기
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
      {/* info-summary-bar 구조로 상단 박스 통일 */}
      <div
        className="info-summary-bar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 36,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div className="info-title">
            <span className="company">{company.name}</span>
            <span className="code">{company.ticker}</span>
          </div>
          <input className="search-bar" placeholder="다른 기업 검색하기" />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 20,
              padding: "0 18px",
              height: 38,
              fontWeight: 700,
              fontSize: "1.01rem",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={handleLetsGo}
          >
            <FaHeart style={{ marginRight: 6 }} />
            레쓰고
          </button>
          <button
            className="btn-home"
            onClick={() => navigate("/")}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 20,
              padding: "0 18px",
              height: 38,
              fontWeight: 700,
              fontSize: "1.01rem",
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <FaHome size={18} style={{ marginRight: 6 }} />홈
          </button>
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
          }}
        >
          <div className="card-title-row">
            <h3>찐으로 많이 나온 단어들</h3>
            <span className="card-icon">💬 종목토론실</span>
          </div>
          <ol className="keyword-top-list">
            {(showForumAll ? forumKeywords : forumKeywords.slice(0, 10)).map(
              (item, idx) => (
                <li
                  key={item.keyword}
                  className="keyword-top-item"
                  onClick={() => handleForumKeywordClick(item.keyword)}
                >
                  <span className="rank-badge forum">{idx + 1}</span>
                  <span className="keyword-link">
                    {item.keyword} <FaExternalLinkAlt size={12} />
                  </span>
                  <span className="keyword-count">
                    {item.count.toLocaleString()}회
                  </span>
                </li>
              )
            )}
          </ol>
          <button
            className="more-btn"
            onClick={() => setShowForumAll((v) => !v)}
          >
            {showForumAll ? "Top 10만 보기" : "더보기 (20위까지)"}
          </button>
          <div className="bar-chart-area">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={forumKeywords.slice(0, 7)}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="keyword" type="category" width={90} />
                <Tooltip formatter={(v: any) => `${v}회`} />
                <Bar dataKey="count" fill="#1976d2">
                  {forumKeywords.slice(0, 7).map((entry, idx) => (
                    <Cell key={`cell-forum-${idx}`} fill={COLORS[0]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="bar-chart-label">언급 횟수</div>
          </div>
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
          }}
        >
          <div className="card-title-row">
            <h3>기자들이 자꾸 쓰는 단어들</h3>
            <span className="card-icon">📰 뉴스</span>
          </div>
          <ol className="keyword-top-list">
            {(showNewsAll ? newsKeywords : newsKeywords.slice(0, 10)).map(
              (item, idx) => (
                <li
                  key={item.keyword}
                  className="keyword-top-item"
                  onClick={() => handleNewsKeywordClick(item.keyword)}
                >
                  <span className="rank-badge news">{idx + 1}</span>
                  <span className="keyword-link news-link">
                    {item.keyword} <FaExternalLinkAlt size={12} />
                  </span>
                  <span className="keyword-count">
                    {item.count.toLocaleString()}회
                  </span>
                </li>
              )
            )}
          </ol>
          <button
            className="more-btn"
            onClick={() => setShowNewsAll((v) => !v)}
          >
            {showNewsAll ? "Top 10만 보기" : "더보기 (20위까지)"}
          </button>
          <div className="bar-chart-area">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={newsKeywords.slice(0, 7)}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="keyword" type="category" width={90} />
                <Tooltip formatter={(v: any) => `${v}회`} />
                <Bar dataKey="count" fill="#43a047">
                  {newsKeywords.slice(0, 7).map((entry, idx) => (
                    <Cell key={`cell-news-${idx}`} fill={COLORS[1]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="bar-chart-label">언급 횟수</div>
          </div>
        </section>
      </div>
      {/* 하단 트렌드+어제 관심도 */}
      <div className="trend-bottom-row">
        <div className="trend-bottom-left">
          <h3>어제 이 종목, 1년 중 얼마나 뜨거웠을까?</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={googleTrends}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(v: any) => `${v}점`} />
              <Line
                type="monotone"
                dataKey="index"
                stroke="#1976d2"
                strokeWidth={2}
                dot={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="trend-bottom-right">
          <div className="trend-pie-title">어제 관심도</div>
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
              <Pie
                data={[
                  { name: "점수", value: yesterdayScore },
                  { name: "나머지", value: maxScore - yesterdayScore },
                ]}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                startAngle={90}
                endAngle={-270}
                label={false}
              >
                <Cell fill="#1976d2" />
                <Cell fill="#e0e0e0" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="trend-score">
            {yesterdayScore} / {maxScore}
          </div>
        </div>
      </div>
    </div>
  );
}
