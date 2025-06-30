import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  ReferenceArea,
} from "recharts";
import "../../styles/info.css";

// 예시 데이터
const priceData = [
  {
    date: "2024-06-01",
    close: 72000,
    volume: 1200000,
    movingAvg5: 71500,
    movingAvg20: 70000,
    RSI: 72,
  },
  {
    date: "2024-06-02",
    close: 73000,
    volume: 1300000,
    movingAvg5: 72000,
    movingAvg20: 70500,
    RSI: 75,
  },
  {
    date: "2024-06-03",
    close: 74000,
    volume: 1100000,
    movingAvg5: 72500,
    movingAvg20: 71000,
    RSI: 78,
  },
  {
    date: "2024-06-04",
    close: 73500,
    volume: 900000,
    movingAvg5: 73000,
    movingAvg20: 71500,
    RSI: 68,
  },
  {
    date: "2024-06-05",
    close: 75000,
    volume: 1500000,
    movingAvg5: 73500,
    movingAvg20: 72000,
    RSI: 80,
  },
  {
    date: "2024-06-06",
    close: 76000,
    volume: 1700000,
    movingAvg5: 74400,
    movingAvg20: 72800,
    RSI: 82,
  },
  {
    date: "2024-06-07",
    close: 77000,
    volume: 1600000,
    movingAvg5: 75200,
    movingAvg20: 73500,
    RSI: 85,
  },
  {
    date: "2024-06-08",
    close: 76500,
    volume: 1400000,
    movingAvg5: 75600,
    movingAvg20: 74000,
    RSI: 78,
  },
  {
    date: "2024-06-09",
    close: 75500,
    volume: 1200000,
    movingAvg5: 76000,
    movingAvg20: 74500,
    RSI: 65,
  },
  {
    date: "2024-06-10",
    close: 75000,
    volume: 1100000,
    movingAvg5: 75800,
    movingAvg20: 74800,
    RSI: 60,
  },
];
const financialSummary = {
  profitability: "8.2%",
  growth: "5.1%",
  stability: "양호",
  activity: "보통",
};
const ESG = { score: 78, grade: "A" };
// 골든크로스 구간 예시(인덱스 기준)
const goldenCrossRanges = [{ start: 4, end: 6 }];

export default function InfoMain() {
  // 과매수/과매도 상태 계산
  const latestRSI = priceData[priceData.length - 1]?.RSI ?? 50;
  let rsiText = "중립";
  if (latestRSI >= 70) rsiText = "지금은 과매수 상태입니다";
  else if (latestRSI <= 30) rsiText = "지금은 과매도 상태입니다";

  return (
    <div className="info-main-wrap">
      {/* 상단 고정 */}
      <header className="info-header">
        <div className="company-info">삼성전자 (005930)</div>
        <div className="search-bar-fixed">
          <input type="text" placeholder="종목/키워드 검색" />
        </div>
      </header>
      {/* 주가 차트 + RSI + 거래량 */}
      <div className="price-chart-area">
        <h3>주가 차트 (일봉)</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={priceData}
            margin={{ top: 20, right: 40, left: 0, bottom: 0 }}
          >
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis
              yAxisId="left"
              domain={[70000, 80000]}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
            />
            <Tooltip />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="close"
              stroke="#222"
              dot={false}
              name="종가"
              strokeWidth={2}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="movingAvg5"
              stroke="#8884d8"
              dot={false}
              name="5일선"
              strokeWidth={2}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="movingAvg20"
              stroke="#82ca9d"
              dot={false}
              name="20일선"
              strokeWidth={2}
            />
            {goldenCrossRanges.map((r, i) => (
              <ReferenceArea
                key={i}
                x1={priceData[r.start].date}
                x2={priceData[r.end].date}
                yAxisId="left"
                fill="#ffe082"
                fillOpacity={0.3}
              />
            ))}
            <Bar
              yAxisId="right"
              dataKey="volume"
              barSize={10}
              fill="#b0b0b0"
              name="거래량"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="rsi-area">
          <h4>RSI</h4>
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart
              data={priceData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis dataKey="date" hide />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="RSI"
                stroke="#ff8042"
                fill="#ffe0b2"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="rsi-text">{rsiText}</div>
        </div>
      </div>
      {/* 하단: 재무제표/ESG */}
      <div className="summary-area">
        <div className="financial-summary">
          <h4>재무제표 요약</h4>
          <table>
            <tbody>
              <tr>
                <th>수익성</th>
                <td>{financialSummary.profitability}</td>
              </tr>
              <tr>
                <th>성장성</th>
                <td>{financialSummary.growth}</td>
              </tr>
              <tr>
                <th>안정성</th>
                <td>{financialSummary.stability}</td>
              </tr>
              <tr>
                <th>활동성</th>
                <td>{financialSummary.activity}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="esg-summary">
          <h4>ESG 등급</h4>
          <div className="esg-card">
            <div className="esg-score">{ESG.score}</div>
            <div className="esg-grade">{ESG.grade}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
