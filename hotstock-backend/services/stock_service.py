import pandas as pd
from pathlib import Path
from services.gg_trend import get_trend_data
from datetime import datetime, timedelta
from typing import Dict, Any
import numpy as np

COMPANY_CSV = "./data/2024_final_ticker_list.csv"
# 검색어 자동 완성 기능
def search_company(query: str, limit: int = 10):
    df = pd.read_csv(COMPANY_CSV, dtype={"ticker":str})
    result = df[df['corp_name'].str.contains(query, case=False, na=False)]
    return result.head(limit).to_dict(orient="records")

# 종토방, 뉴스 키워드 횟수랑 단어 분리
def parse_keywords_row(row):
    row = row.replace({pd.NA: None, float("nan"): None})  # 혹시 모를 NaN 보정

    keywords = []
    for i in range(1, 21):
        raw = row.get(f"keyword{i}")

        if raw is None or not isinstance(raw, str) or raw.strip() == "":
            continue

        # 형식이 "단어(숫자회)"일 때만 파싱
        if "(" in raw and raw.endswith(")"):
            try:
                word, count = raw.rstrip(")").split("(")
                keywords.append({
                    "word": word.strip(),
                    "count": int(count.replace("회", "").strip())
                })
            except ValueError:
                continue
    return keywords


# 포럼 페이지
def get_forum_page_data(ticker: str):
    forums = pd.read_csv("./data/forums.csv", dtype={'ticker':str})
    news = pd.read_csv("./data/news.csv", dtype={'ticker':str})

    # 종토방 키워드
    forum_row = forums[forums["ticker"] == ticker]
    forum_keywords = parse_keywords_row(forum_row.iloc[0]) if not forum_row.empty else []

    # 뉴스 키워드
    news_row = news[news["ticker"] == ticker]
    news_keywords = parse_keywords_row(news_row.iloc[0]) if not news_row.empty else []

    trend_df = get_trend_data(ticker)
    

    return {
        "forums": forum_keywords,
        "news": news_keywords,
        "trend": trend_df
    }

# 외부 함수 가정
from services.price_chart import get_price_chart
from services.indicators import get_indicator_summary, get_indicator_chart
from services.reports import get_latest_reports
from services.multiples import get_multiples

# 상세 페이지 
def get_detail_page_data(ticker: str) -> Dict[str, Any]:
    # CSV 데이터 불러오기
    financial_indicators_df = pd.read_csv("./data/financial_indicators.csv", dtype={"ticker":str})
    financial_states_df = pd.read_csv("./data/collect_finance.csv", dtype={"ticker":str})
    esg_df = pd.read_csv("./data/esg.csv", dtype={"ticker":str})

    # ✅ CSV 기반
    fi_row = financial_indicators_df[financial_indicators_df["ticker"] == ticker]
    fs_row = financial_states_df[financial_states_df["ticker"] == ticker]
    esg_row = esg_df[esg_df["ticker"] == ticker]

    # ✅ NaN → None 처리 후 dict 변환
    def safe_row_to_dict(row):
        return row.replace({np.nan: None}).to_dict()

    financial_indicators = safe_row_to_dict(fi_row.iloc[0]) if not fi_row.empty else {}
    financial_states = safe_row_to_dict(fs_row.iloc[0]) if not fs_row.empty else {}
    esg = safe_row_to_dict(esg_row.iloc[0]) if not esg_row.empty else {}

    # ✅ 실시간 함수 기반
    price_chart = get_price_chart(ticker)  # ex: [{"date": ..., "price": ..., ...}, ...]
    indicator_chart = get_indicator_chart(ticker)
    indicators = get_indicator_summary(ticker)  # ex: {"rsi": "...", "volume": "...", ...}
    reports = get_latest_reports(ticker)  # ex: [{"title": ..., "pdf_url": ..., ...}]
    multiples = get_multiples(ticker)  # ex: {"per": ..., "eps": ..., ...}

    return {
        "price_chart": price_chart,
        "indicator_chart": indicator_chart,
        "indicators": indicators,
        "financial_indicators": financial_indicators,
        "financial_states": financial_states,
        "esg": esg,
        "reports": reports,
        "multiples": multiples
    }

