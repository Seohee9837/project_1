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
    return None, None  # 실패 시 None 반환

def get_multiples(ticker: str) -> dict:
    date, df = get_valid_date_and_data(ticker)
    if df is None:
        return {
            "date": None,
            "per": None,
            "eps": None,
            "bps": None,
            "pbr": None,
            "dps": None,
            "div": None
        }

    data = df.iloc[0]

    return {
        "date": date,
        "per": round(data["PER"], 2),
        "eps": round(data["EPS"], 2),
        "bps": round(data["BPS"], 2),
        "pbr": round(data["PBR"], 2),
        "dps": round(data["DPS"], 2),
        "div": round(data["DIV"], 2)
    }
