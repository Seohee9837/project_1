# trend_api.py

import urllib.request
import json
import pandas as pd
from .config import NAVER_CLIENT_ID, NAVER_CLIENT_SECRET

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
