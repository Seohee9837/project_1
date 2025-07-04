import React from "react";

export default function OpinionPage() {
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
        <h2>여론 분석 페이지 (예시)</h2>
        <p>여기서 종목토론실/뉴스 키워드, 트렌드, 그래프 등 구현</p>
      </div>
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
    </>
  );
}
