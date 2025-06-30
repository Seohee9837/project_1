import FinanceDataReader as fdr
from datetime import datetime, timedelta
import json
def get_price_chart(ticker, json_filename='chart_data.json'):
    # 날짜 설정
    end_date = datetime.today() - timedelta(days=1)
    start_date = end_date - timedelta(days=365)
    start = start_date.strftime('%Y-%m-%d')
    end = end_date.strftime('%Y-%m-%d')

    # 데이터 로딩
    df = fdr.DataReader(ticker, start, end)
    if df.empty:
        print(f"{ticker}에 대한 데이터를 찾을 수 없습니다.")
        return

    # 필요한 데이터만 추출 (날짜, 종가, 거래량)
    data_to_save = []
    for date, close, volume in zip(df.index, df['Close'], df['Volume']):
        data_to_save.append({
            "Date": date.strftime('%Y-%m-%d'),
            "Close": close,
            "Volume": volume
        })

    # JSON 파일로 저장
    return data_to_save