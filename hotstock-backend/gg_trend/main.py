# main.py
from company_utils import get_cp_name_from_csv
from trend_api import get_trend_df
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import pandas as pd

# 사용자로부터 종목코드 입력 받기
stock_code = input("종목코드를 입력하세요 (예: 005930): ").strip()

# 날짜 자동 설정
today = datetime.today()
start_date = today.strftime("%Y-%m-%d")
end_date = (today - timedelta(days=365)).strftime("%Y-%m-%d")

# 경로 설정
csv_path = "company_with_corp_code.csv"

# 기업명 찾기
try:
    cp_name = get_cp_name_from_csv(stock_code, csv_path)
    print(f"🔍 조회 기업명: {cp_name}")
except ValueError as e:
    print(e)
    exit()

# 트렌드 데이터 불러오기
try:
    df_trend = get_trend_df(cp_name, end_date, start_date)  # 주의: 네이버 API는 end_date가 과거

    plt.figure(figsize=(12, 6))
    plt.plot(df_trend.index, df_trend['ratio'], marker='o', linestyle='-')  # ✅ index를 x축으로 사용
    plt.title(f"{cp_name} 검색 트렌드")
    plt.xlabel("날짜")
    plt.ylabel("검색 비율 (%)")
    plt.grid(True)
    plt.tight_layout()
    plt.show()

except Exception as e:
    print("❌ API 호출 실패:", e)