import os
import re
import requests
import pandas as pd
from newspaper import Article
from datetime import datetime, timedelta
from email.utils import parsedate_to_datetime
from collections import Counter
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

openai_client = OpenAI(api_key=OPENAI_API_KEY)

# 📂 상대 경로 (news_collector.py 기준)
CSV_PATH = "../../2024_final_ticker_list.csv"
OUTPUT_PATH = "../data/news.csv"

# 📁 모든 티커 불러오기
def load_all_tickers(csv_path=CSV_PATH):
    try:
        df = pd.read_csv(csv_path, dtype=str)
        return list(df[["ticker", "corp_name"]].dropna().itertuples(index=False, name=None))
    except Exception as e:
        print(f"[ERROR] CSV 로딩 실패: {e}")
        return []

# 🔍 네이버 뉴스 검색
def search_naver_news_all(query, target_dates):
    headers = {
        "X-Naver-Client-Id": NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": NAVER_CLIENT_SECRET
    }
    all_filtered = []
    for start in range(1, 500, 100):
        params = {
            "query": query,
            "display": 100,
            "start": start,
            "sort": "sim"
        }
        try:
            response = requests.get("https://openapi.naver.com/v1/search/news.json", headers=headers, params=params)
            response.raise_for_status()
        except:
            break
        items = response.json().get("items", [])
        for item in items:
            try:
                pubdate = parsedate_to_datetime(item["pubDate"]).date()
                if pubdate in target_dates:
                    all_filtered.append(item["originallink"].replace("amp;", ""))
            except:
                continue
    return all_filtered

# 📄 기사 본문 추출
def extract_article_text(url):
    try:
        article = Article(url, language="ko")
        article.download()
        article.parse()
        return article.text
    except:
        return None

# 🏷️ 키워드 추출
def extract_keywords(text):
    return re.findall(r'\b[가-힣]{2,}\b', text)

# 🤖 GPT 필터링
def filter_keywords_with_gpt(top_keywords, company_name):
    keyword_list = [f"{word}({freq})" for word, freq in top_keywords if word != company_name]
    keyword_str = ", ".join(keyword_list)

    prompt = f"""
다음은 뉴스 기사에서 추출한 상위 키워드 목록입니다. 이 중에서 다음과 같은 조건에 해당하는 단어는 전부 제거하고, 핵심 명사 키워드만 남겨주세요.

- 기업 이름 자체
- 조사(이, 가, 을, 를, 은, 는 등)
- 불용어, 어미가 붙은 단어 (예: 갈등이 → 갈등)
- 일반적으로 뉴스 기사에서 자주 등장하지만 의미 없는 단어 (예: 관련, 진행, 상황 등)
- 의미가 중복되거나 너무 추상적인 단어

최종적으로는 **명사형 핵심 키워드만** 남기고, 형태소가 섞인 단어는 원형으로 정제해주세요.

출력 형식은 반드시 다음처럼 해주세요:
키워드1(횟수), 키워드2(횟수), 키워드3(횟수), ...

다음은 키워드와 언급횟수입니다: {keyword_str}

"""
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "당신은 뉴스 키워드 필터링 도우미입니다."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"[ERROR] GPT 응답 오류: {e}")
        return ""

# 🎯 GPT 응답 파싱
def parse_filtered_keywords(filtered_str):
    pattern = re.compile(r'([^,()\s]+)\((\d+)\)')
    return [(m.group(1), int(m.group(2))) for m in pattern.finditer(filtered_str)]

# 🔁 최근 뉴스 수집
def get_recent_articles(company_name, max_days=7):
    today = datetime.now().date()
    for i in range(max_days):
        check_date = today - timedelta(days=i+1)
        articles = search_naver_news_all(company_name, [check_date])
        if articles:
            return articles
    return []

# ✅ 단일 티커 처리
def process_ticker(ticker, corp_name):
    urls = get_recent_articles(corp_name)
    if not urls:
        print(f"[SKIP] 뉴스 없음: {corp_name}")
        return None

    full_text = ""
    for url in urls:
        text = extract_article_text(url)
        if text:
            full_text += text + "\n"

    keywords = extract_keywords(full_text)
    keyword_freq = Counter(keywords).most_common(30)

    filtered = filter_keywords_with_gpt(keyword_freq, corp_name)
    filtered_keywords = parse_filtered_keywords(filtered)

    # 무조건 20개 채우기
    row = {"ticker": ticker, "corp_name": corp_name}
    for i in range(20):
        if i < len(filtered_keywords):
            word, freq = filtered_keywords[i]
            row[f"keyword{i+1}"] = f"{word}({freq})"
        else:
            row[f"keyword{i+1}"] = ""
    return row

# ✅ 전체 실행 함수
def collect_all_keywords(limit=10):  # limit=5로 테스트 가능  ------------------> 여기 limit=5
    tickers = load_all_tickers()[:limit]  # 상위 N개 티커만  ------------------> 여기 [:limit]
    results = []

    for ticker, corp_name in tickers:
        print(f"[진행중] {corp_name} ({ticker})")
        row = process_ticker(ticker, corp_name)
        if row:
            results.append(row)

    if results:
        df = pd.DataFrame(results)
        os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
        df.to_csv(OUTPUT_PATH, index=False, encoding="utf-8-sig")
        print(f"[완료] {len(results)}개 기업 저장 → {OUTPUT_PATH}")
    else:
        print("[알림] 저장할 데이터 없음")

# 🚀 실행
if __name__ == "__main__":
    collect_all_keywords(limit=10)  # ------> 지금은 되나 확인용 나중에 limit=5 까지 3개개지우면 됨 ~ㅅ~
