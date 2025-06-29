import pandas as pd

def collect_forum_keywords():
    # 수집된 데이터 예시 (실제 크롤링 또는 분석 로직 넣기)
    # data = [
    #    {
    #        "ticker": "005930",
    #        "keyword1": "반도체(300)",
    #        "keyword2": "갤럭시(180)",
    #        ...
    #    },
    #    ...
    #]

    df = pd.DataFrame(data)
    df.to_csv("data/forums.csv", index=False, encoding="utf-8-sig")
    print("✅ forums.csv 저장 완료")
