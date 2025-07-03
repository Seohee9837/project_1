import FinanceDataReader as fdr
import pandas as pd
import json
import os
from datetime import datetime, timedelta

def get_indicator_chart(ticker: str):
    end_date = datetime.today() - timedelta(days=1)
    start_date = end_date - timedelta(days=365)
    df = fdr.DataReader(ticker, start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))

    # 보조지표 계산
    df['MA20'] = df['Close'].rolling(window=20).mean()
    df['MA60'] = df['Close'].rolling(window=60).mean()
    delta = df['Close'].diff()
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)
    avg_gain = gain.rolling(window=14).mean()
    avg_loss = loss.rolling(window=14).mean()
    rs = avg_gain / avg_loss
    df['RSI'] = 100 - (100 / (1 + rs))

    # NaN 값 처리: NaN을 0으로 대체하지 않고 그대로 두거나, 차트에서 NaN 값을 제외하도록 함
    df_clean = df.dropna(subset=['MA20', 'MA60', 'RSI'])

    # 주가와 보조지표 데이터를 딕셔너리 형태로 반환
    price_chart_data = []
    for i in range(len(df_clean)):
        data_point = {
            "date": df_clean.index[i].strftime('%Y-%m-%d'),
            "price": int(df_clean['Close'].iloc[i]),
            "moving_20": int(df_clean['MA20'].iloc[i]),
            "moving_60": int(df_clean['MA60'].iloc[i]),
            "rsi": float(df_clean['RSI'].iloc[i])
        }
        price_chart_data.append(data_point)

    # JSON으로 변환하여 반환
    return price_chart_data

def get_indicator_summary(ticker: str):
    # 날짜 범위 설정
    end_date = datetime.today() - timedelta(days=1)
    start_date = end_date - timedelta(days=365)
    df = fdr.DataReader(ticker, start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d'))

    # 보조지표 계산 (이 부분을 get_indicator_summary 안에 포함시킴)
    df['MA20'] = df['Close'].rolling(window=20).mean()
    df['MA60'] = df['Close'].rolling(window=60).mean()
    delta = df['Close'].diff()
    gain = delta.where(delta > 0, 0)
    loss = -delta.where(delta < 0, 0)
    avg_gain = gain.rolling(window=14).mean()
    avg_loss = loss.rolling(window=14).mean()
    rs = avg_gain / avg_loss
    df['RSI'] = 100 - (100 / (1 + rs))
    
    # 이동평균선 골든/데드크로스 감지
    golden_cross = df[(df['MA20'] > df['MA60']) & (df['MA20'].shift(1) <= df['MA60'].shift(1))]
    dead_cross = df[(df['MA20'] < df['MA60']) & (df['MA20'].shift(1) >= df['MA60'].shift(1))]

    # RSI 과매수/과매도 구간 추출
    overbought_periods = []
    oversold_periods = []
    in_overbought = in_oversold = False
    for i in range(1, len(df)):
        if df['RSI'].iloc[i] > 70 and not in_overbought:
            start = df.index[i]
            in_overbought = True
        if df['RSI'].iloc[i] <= 70 and in_overbought:
            end = df.index[i - 1]
            overbought_periods.append((start, end))
            in_overbought = False
        if df['RSI'].iloc[i] < 30 and not in_oversold:
            start = df.index[i]
            in_oversold = True
        if df['RSI'].iloc[i] >= 30 and in_oversold:
            end = df.index[i - 1]
            oversold_periods.append((start, end))
            in_oversold = False

    # annotations: 현재 상태와 최근 변화 추가
    annotations = []
    
    # 현재 상태 추가
    rsi_summary = "과매수 구간입니다" if df['RSI'].iloc[-1] > 70 else "과매도 구간입니다" if df['RSI'].iloc[-1] < 30 else "정상 범위 내"
    moving_avg_summary = "20일선이 60일선을 상향 돌파" if df['MA20'].iloc[-1] > df['MA60'].iloc[-1] else "20일선이 60일선을 하향 돌파"
    
    annotations.append(f"현재 RSI 상태: {rsi_summary}")
    annotations.append(f"현재 이동평균선 상태: {moving_avg_summary}")
    
    # 최근 변화 추가
    if overbought_periods:
        latest = overbought_periods[-1][0]
        annotations.append(f"최근 RSI 과매수 시작: {latest.strftime('%Y-%m-%d')}")
    
    if oversold_periods:
        latest = oversold_periods[-1][0]
        annotations.append(f"최근 RSI 과매도 시작: {latest.strftime('%Y-%m-%d')}")
    
    if not golden_cross.empty:
        latest = golden_cross.index[-1]  # Use index for dates
        annotations.append(f"최근 MA 골든크로스: {latest.strftime('%Y-%m-%d')}")
    
    if not dead_cross.empty:
        latest = dead_cross.index[-1]  # Use index for dates
        annotations.append(f"최근 MA 데드크로스: {latest.strftime('%Y-%m-%d')}")
    
    indicator_summary ={"rsi": ", ".join(annotations[:4]) if len(annotations) >= 4 else ", ".join(annotations[:len(annotations)]),
    "moving_avg": ", ".join(annotations[1:2] + annotations[4:6])  # 1번은 이동평균 summary
    }
    
    # JSON으로 반환
    return indicator_summary
