import os
import json
import urllib.request
import pandas as pd
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv(dotenv_path = "./jobs/.env")

# ─────────────────────────────────────────────
# ✅ config
NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")

# ─────────────────────────────────────────────
# ✅ 기업명 조회
def get_cp_name_from_csv(ticker: str, csv_path: str = "./data/2024_final_ticker_list.csv") -> str:
    df = pd.read_csv(csv_path, dtype={"ticker": str})
    df["ticker"] = df["ticker"].str.strip()
    matched = df[df["ticker"] == ticker]
    if matched.empty:
        raise ValueError(f"{ticker}에 해당하는 기업명이 없습니다.")
    return matched.iloc[0]["corp_name"]

# ─────────────────────────────────────────────
# ✅ 네이버 검색 트렌드 데이터 수집
def get_trend_df(cp_name: str, start_date: str, end_date: str, device: str = "pc") -> pd.DataFrame:
    body = {
        "startDate": start_date,
        "endDate": end_date,
        "timeUnit": "date",
        "keywordGroups": [
            {
                "groupName": cp_name,
                "keywords": [cp_name]
            }
        ],
        "device": device
    }

    url = "https://openapi.naver.com/v1/datalab/search"
    request = urllib.request.Request(url)
    request.add_header("X-Naver-Client-Id", NAVER_CLIENT_ID)
    request.add_header("X-Naver-Client-Secret", NAVER_CLIENT_SECRET)
    request.add_header("Content-Type", "application/json")

    response = urllib.request.urlopen(request, data=json.dumps(body).encode("utf-8"))
    rescode = response.getcode()

    if rescode != 200:
        raise Exception("API 호출 실패: " + str(rescode))

    response_text = response.read().decode("utf-8")
    data_json = json.loads(response_text)
    data_list = data_json["results"][0]["data"]

    df = pd.DataFrame(data_list)
    df["period"] = pd.to_datetime(df["period"])
    df.set_index("period", inplace=True)

    return df

# ─────────────────────────────────────────────
# ✅ 외부 호출용 메인 함수
def get_trend_data(ticker: str) -> list[dict]:
    today = datetime.today()
    start_date = (today - timedelta(days=365)).strftime("%Y-%m-%d")
    end_date = today.strftime("%Y-%m-%d")

    cp_name = get_cp_name_from_csv(ticker)
    df = get_trend_df(cp_name, start_date, end_date)

    trend_data = [
        {"date": date.strftime("%Y-%m-%d"), "score": int(score)}
        for date, score in zip(df.index, df["ratio"])
    ]
    return trend_data
