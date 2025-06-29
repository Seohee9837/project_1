from pykrx import stock
from datetime import datetime, timedelta

def get_valid_date_and_data(ticker: str):
    today = datetime.today()
    for _ in range(10):  # 최근 10일 이내 영업일 탐색
        date_str = today.strftime("%Y%m%d")
        try:
            df = stock.get_market_fundamental(date_str, date_str, ticker)
            if not df.empty:
                return date_str, df
        except:
            pass
        today -= timedelta(days=1)
    raise ValueError("최근 10일 간 유효한 데이터가 없습니다.")

def get_multiples(ticker: str) -> dict:
    date, df = get_valid_date_and_data(ticker)
    data = df.iloc[0]  # 단일 행

    return {
        "date": date,  # ✅ 조회 날짜 포함
        "per": round(data["PER"], 2),
        "eps": round(data["EPS"], 2),
        "bps": round(data["BPS"], 2),
        "pbr": round(data["PBR"], 2),
        "dps": round(data["DPS"], 2),
        "div": round(data["DIV"], 2)
    }

# ✅ 실행
ticker = input("종목코드를 입력하세요 (예: 005930): ").strip()
try:
    result = get_multiples(ticker)
    print("multiples:", result)
except Exception as e:
    print("❌ 오류:", e)
