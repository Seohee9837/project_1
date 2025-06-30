import pandas as pd
from pathlib import Path
from gg_trend.company_utils import get_cp_name_from_csv
from gg_trend.trend_api import get_trend_df
from datetime import datetime, timedelta
from typing import Dict, Any


COMPANY_CSV = "./data/2024_final_ticker_list.csv"
# 검색어 자동 완성 기능
def search_company(query: str, limit: int = 10):
    df = pd.read_csv(COMPANY_CSV, dtype={"ticker":str})
    result = df[df['corp_name'].str.contains(query, na=False)]
    return result.head(limit).to_dict(orient="records")

# 종토방, 뉴스 키워드 횟수랑 단어 분리
def parse_keywords_row(row):
    keywords = []
    for i in range(1, 21):
        raw = row.get(f"keyword{i}")
        if pd.isna(raw):
            continue
        try:
            word, count = raw.rstrip(")").split("(")
            keywords.append({"word": word.strip(), "count": int(count)})
        except:
            continue
    return keywords

# 포럼 페이지
def get_forum_page_data(ticker: str):
    forums = pd.read_csv("./data/forums.csv")
    news = pd.read_csv("./data/news.csv")

    # 종토방 키워드
    forum_row = forums[forums["ticker"] == ticker]
    forum_keywords = parse_keywords_row(forum_row.iloc[0]) if not forum_row.empty else []

    # 뉴스 키워드
    news_row = news[news["ticker"] == ticker]
    news_keywords = parse_keywords_row(news_row.iloc[0]) if not news_row.empty else []

    # ✅ 구글 트렌드 - 기업명 추출 후 get_trend_df 호출
    try:
        cp_name = get_cp_name_from_csv(ticker, "./data/2024_final_ticker_list.csv")
        today = datetime.today()
        start_date = today.strftime("%Y-%m-%d")
        end_date = (today - timedelta(days=365)).strftime("%Y-%m-%d")
        trend_df = get_trend_df(cp_name, end_date, start_date)

        trend_data = [
            {"date": date.strftime("%Y-%m-%d"), "score": int(score)}
            for date, score in zip(trend_df.index, trend_df["ratio"])
        ]
    except Exception as e:
        print(f"❌ Trend fetch failed for {ticker}: {e}")
        trend_data = []

    return {
        "forums": forum_keywords,
        "news": news_keywords,
        "trend": trend_data
    }

# 외부 함수 가정
from services.price_chart import get_price_chart
from services.indicators import get_indicator_summary
from services.reports import get_latest_reports
from services.multiples import get_multiples

# 상세 페이지 
def get_detail_page_data(ticker: str) -> Dict[str, Any]:
    # CSV 데이터 불러오기
    financial_indicators_df = pd.read_csv("./data/financial_indicators.csv")
    # financial_states_df = pd.read_csv("./data/financial_states.csv")
    esg_df = pd.read_csv("./data/esg.csv")

    # ✅ CSV 기반
    fi_row = financial_indicators_df[financial_indicators_df["ticker"] == ticker]
    # fs_row = financial_states_df[financial_states_df["ticker"] == ticker]
    esg_row = esg_df[esg_df["ticker"] == ticker]

    financial_indicators = fi_row.iloc[0].to_dict() if not fi_row.empty else {}
    # financial_states = fs_row.iloc[0].to_dict() if not fs_row.empty else {}
    esg = esg_row.iloc[0].to_dict() if not fi_row.empty else {}

    # ✅ 실시간 함수 기반
    price_chart = get_price_chart(ticker)  # ex: [{"date": ..., "price": ..., ...}, ...]
    indicators = get_indicator_summary(ticker)  # ex: {"rsi": "...", "volume": "...", ...}
    reports = get_latest_reports(ticker)  # ex: [{"title": ..., "pdf_url": ..., ...}]
    multiples = get_multiples(ticker)  # ex: {"per": ..., "eps": ..., ...}

    return {
        "price_chart": price_chart,
        "indicators": indicators,
        "financial_indicators": financial_indicators,
        # "financial_states": financial_states,
        "esg": esg,
        "reports": reports,
        "multiples": multiples
    }

