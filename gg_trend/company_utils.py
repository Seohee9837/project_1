# company_utils.py

import pandas as pd

def get_cp_name_from_csv(ticker: str, csv_path: str) -> str:
    df = pd.read_csv(csv_path, dtype={"ticker": str})
    matched = df[df["ticker"] == ticker]
    if matched.empty:
        raise ValueError(f"{ticker}에 해당하는 기업명이 없습니다.")
    return matched.iloc[0]["cp_name"]
