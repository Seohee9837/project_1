import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "recharts";
import { FaHeart, FaHome, FaComments, FaChartBar } from "react-icons/fa";
import "../../styles/info.css";

// 예시 데이터 (실제 데이터 연동 필요)
const priceData = [
  {
    month: "1월",
    price: 68000,
    ma20: 67000,
    ma60: 66000,
    RSI: 60,
    volume: 1000000,
  },
  {
    month: "2월",
    price: 70000,
    ma20: 68000,
    ma60: 66500,
    RSI: 62,
    volume: 1200000,
  },
  {
    month: "3월",
    price: 72000,
    ma20: 69000,
    ma60: 67000,
    RSI: 65,
    volume: 1300000,
  },
  {
    month: "4월",
    price: 71000,
    ma20: 70000,
    ma60: 67500,
    RSI: 67,
    volume: 1100000,
  },
  {
    month: "5월",
    price: 75000,
    ma20: 71000,
    ma60: 68000,
    RSI: 70,
    volume: 1500000,
  },
  {
    month: "6월",
    price: 78000,
    ma20: 72000,
    ma60: 69000,
    RSI: 72,
    volume: 1700000,
  },
  {
    month: "7월",
    price: 77000,
    ma20: 73000,
    ma60: 70000,
    RSI: 74,
    volume: 1600000,
  },
  {
    month: "8월",
    price: 80000,
    ma20: 74000,
    ma60: 71000,
    RSI: 76,
    volume: 1800000,
  },
  {
    month: "9월",
    price: 82000,
    ma20: 75000,
    ma60: 72000,
    RSI: 78,
    volume: 2000000,
  },
  {
    month: "10월",
    price: 81000,
    ma20: 76000,
    ma60: 73000,
    RSI: 80,
    volume: 1700000,
  },
  {
    month: "11월",
    price: 83000,
    ma20: 77000,
    ma60: 74000,
    RSI: 82,
    volume: 2100000,
  },
  {
    month: "12월",
    price: 85400,
    ma20: 84800,
    ma60: 82000,
    RSI: 73.2,
    volume: 2200000,
  },
];

const financialSummary = {
  roe: "12.4%",
  opm: "18.7%",
  salesGrowth: "24.3%",
  netIncomeGrowth: "31.8%",
  debtRatio: "32.1%",
  currentRatio: "245%",
  assetTurnover: "0.67",
  inventoryTurnover: "4.2",
};

const esgSummary = {
  env: { grade: "B+", desc: "친환경 기술 개발 및 탄소 저감 노력 인정" },
  soc: { grade: "A-", desc: "임직원 복지와 지역사회 기여도 높음" },
  gov: { grade: "B+", desc: "투명한 경영과 이사회 독립성 양호" },
};

export default function InfoMain() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const handleLetsGo = () => setShowModal(true);
  const handleSelect = (type: string) => {
    if (type === "opinion") window.location.href = "/opinion";
    else if (type === "info") window.location.href = "/info";
  };
  // 과매수/골든크로스 구간 예시
  const overbought = true;
  const goldenCross = true;

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
      {/* 상단 요약 */}
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
            <span className="company">하이닉스</span>
            <span className="code">054930</span>
          </div>
          <span className="price">₩85,400</span>
          <span className="price-up">+2,100 (+2.52%)</span>
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

      {/* 주가 차트 */}
      <div className="chart-section">
        <div className="chart-header">
          <span className="chart-title">주가 차트</span>
          {overbought && (
            <span className="warn-chip">현재 과매수 구간입니다</span>
          )}
          {goldenCross && (
            <span className="golden-chip">골든크로스 발생 중</span>
          )}
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={priceData}
            margin={{ top: 20, right: 40, left: 0, bottom: 0 }}
          >
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" domain={[60000, 90000]} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} hide />
            <Tooltip
              formatter={(value: any, name: any) => [
                value,
                name === "price"
                  ? "주가"
                  : name === "ma20"
                  ? "20일 이동평균"
                  : name === "ma60"
                  ? "60일 이동평균"
                  : name === "RSI"
                  ? "RSI"
                  : name,
              ]}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="price"
              stroke="#1976d2"
              name="주가"
              strokeWidth={3}
              dot
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="ma20"
              stroke="#43a047"
              name="20일 이동평균"
              strokeDasharray="5 2"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="ma60"
              stroke="#ff9800"
              name="60일 이동평균"
              strokeDasharray="3 3"
              strokeWidth={2}
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="RSI"
              stroke="#e53935"
              name="RSI"
              strokeWidth={2}
              dot={false}
            />
            <Bar
              yAxisId="left"
              dataKey="volume"
              barSize={10}
              fill="#b0b0b0"
              name="거래량"
            />
            {/* 골든크로스/과매수 ReferenceArea 등 추가 가능 */}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 보조지표 해석 */}
      <div className="indicator-section">
        <div className="indicator-card">
          <span className="indicator-title">이동평균선</span>
          <span className="indicator-desc">
            20일선이 60일선을 상향 돌파하여 단기 상승 신호가 나타났습니다.
          </span>
        </div>
        <div className="indicator-card warn">
          <span className="indicator-title">RSI (73.2)</span>
          <span className="indicator-desc">
            과매수 구간에 진입했으나, 강한 상승 모멘텀이 지속되고 있습니다.
          </span>
        </div>
        <div className="indicator-card good">
          <span className="indicator-title">거래량</span>
          <span className="indicator-desc">
            평균 거래량 대비 142% 증가로 매수세가 강화되고 있습니다.
          </span>
        </div>
      </div>

      {/* 요약 재무제표 + ESG 평가 */}
      <div
        className="finance-esg-section"
        style={{ flexDirection: "column", gap: "18px" }}
      >
        <div className="finance-summary">
          <div className="finance-title">요약 재무제표</div>
          <div className="finance-row">
            <div className="finance-col">
              <div className="finance-label">수익성</div>
              <div className="finance-value">ROE {financialSummary.roe}</div>
              <div className="finance-value">
                영업이익률 {financialSummary.opm}
              </div>
            </div>
            <div className="finance-col">
              <div className="finance-label">성장성</div>
              <div className="finance-value">
                매출증가율 {financialSummary.salesGrowth}
              </div>
              <div className="finance-value">
                순이익증가율 {financialSummary.netIncomeGrowth}
              </div>
            </div>
            <div className="finance-col">
              <div className="finance-label">안정성</div>
              <div className="finance-value">
                부채비율 {financialSummary.debtRatio}
              </div>
              <div className="finance-value">
                유동비율 {financialSummary.currentRatio}
              </div>
            </div>
            <div className="finance-col">
              <div className="finance-label">활동성</div>
              <div className="finance-value">
                자산회전율 {financialSummary.assetTurnover}
              </div>
              <div className="finance-value">
                재고회전율 {financialSummary.inventoryTurnover}
              </div>
            </div>
          </div>
        </div>
        <div className="esg-summary">
          <div className="esg-title">ESG 평가</div>
          <div className="esg-row">
            <div className="esg-col">
              <div className="esg-grade">{esgSummary.env.grade}</div>
              <div className="esg-label">환경 (E)</div>
              <div className="esg-desc">{esgSummary.env.desc}</div>
            </div>
            <div className="esg-col">
              <div className="esg-grade">{esgSummary.soc.grade}</div>
              <div className="esg-label">사회 (S)</div>
              <div className="esg-desc">{esgSummary.soc.desc}</div>
            </div>
            <div className="esg-col">
              <div className="esg-grade">{esgSummary.gov.grade}</div>
              <div className="esg-label">지배구조 (G)</div>
              <div className="esg-desc">{esgSummary.gov.desc}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
