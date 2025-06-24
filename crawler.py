import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime, timedelta
import time
import json

# ==================== CLOVA Sentiment API 설정 ====================
# 1. 네이버 개발자 센터에서 발급받은 Client ID와 Client Secret을 아래 변수에 입력하세요.
#    (가이드: https://guide.ncloud-docs.com/docs/ko/naveropenapiv3-application)
NAVER_CLIENT_ID = "여기에 Client ID를 입력하세요"
NAVER_CLIENT_SECRET = "여기에 Client Secret을 입력하세요"
# =================================================================

def analyze_sentiment_clova(content):
    """네이버 CLOVA Sentiment API를 사용하여 감성을 분석하는 함수"""
    client_id = NAVER_CLIENT_ID
    client_secret = NAVER_CLIENT_SECRET
    
    if not content or not isinstance(content, str) or not content.strip():
        return 'neutral', 0.0
        
    if client_id == "여기에 Client ID를 입력하세요" or client_secret == "여기에 Client Secret을 입력하세요":
        return 'API 키 필요', 0.0

    url = "https://naveropenapi.apigw.ntruss.com/sentiment-analysis/v1/analyze"
    headers = {
        "X-NCP-APIGW-API-KEY-ID": client_id,
        "X-NCP-APIGW-API-KEY": client_secret,
        "Content-Type": "application/json"
    }
    data = {"content": content[:1000]}

    try:
        response = requests.post(url, data=json.dumps(data), headers=headers)
        if response.status_code == 200:
            result = response.json()
            sentiment = result['document']['sentiment']
            score = result['document']['confidence'][sentiment] / 100.0
            return sentiment, score
        else:
            return 'failed', 0.0
    except Exception:
        return 'error', 0.0

def generate_date_range(start_date: str, end_date: str) -> list:
    start = datetime.strptime(start_date, "%Y.%m.%d")
    end = datetime.strptime(end_date, "%Y.%m.%d")
    return [(start + timedelta(days=i)).strftime("%Y.%m.%d") for i in range((end - start).days + 1)]

def get_all_posts_by_date_range(code, start_date, end_date, page_step=10, max_limit=100):
    target_dates = set(generate_date_range(start_date, end_date))
    base_url = "https://finance.naver.com"
    headers = {'User-Agent': 'Mozilla/5.0'}
    filtered_data = []
    collected_dates = set()
    current_page = 1
    max_page = page_step

    while not target_dates.issubset(collected_dates):
        new_data_found = False  # 새 글 탐지 여부
        for page in range(current_page, max_page + 1):
            list_url = f"{base_url}/item/board.naver?code={code}&page={page}"
            res = requests.get(list_url, headers=headers)
            res.encoding = 'euc-kr'
            soup = BeautifulSoup(res.text, 'html.parser')

            rows = soup.select("table.type2 tr")
            date_tags = soup.select("span.tah.p10.gray03")
            raw_texts = [span.get_text(strip=True) for span in date_tags]
            dates_only = [raw_texts[i].split()[0] for i in range(0, len(raw_texts), 2)]

            if not dates_only:
                print(f":warning: 페이지 {page}에서 더 이상 게시글 없음. 종료합니다.")
                return pd.DataFrame(filtered_data)

            date_index = 0
            for row in rows:
                tds = row.find_all("td")
                if len(tds) < 5:
                    continue

                a_tag = tds[1].find("a")
                if not a_tag or not a_tag.has_attr('href'):
                    continue

                title = a_tag['title']
                href = a_tag['href']
                detail_url = base_url + href

                if date_index >= len(dates_only):
                    continue

                post_date = dates_only[date_index]
                date_index += 1

                if post_date in target_dates:
                    new_data_found = True
                    post_res = requests.get(detail_url, headers=headers)
                    post_res.encoding = 'euc-kr'
                    post_soup = BeautifulSoup(post_res.text, 'html.parser')
                    content_div = post_soup.select_one("div.view_se")
                    content = content_div.get_text(strip=True) if content_div else "본문 없음"

                    filtered_data.append({
                        "날짜": post_date,
                        "제목": title,
                        "본문": content,
                        "링크": detail_url
                    })

                    collected_dates.add(post_date)
                    time.sleep(0.1)

        if not new_data_found:
            print(":white_check_mark: 더 이상 수집할 새로운 데이터 없음. 종료합니다.")
            break

        current_page = max_page + 1
        max_page += page_step

        if max_page > max_limit:
            print(f":no_entry_sign: 최대 페이지 제한({max_limit}) 도달. 중단합니다.")
            break

    return pd.DataFrame(filtered_data)

# :white_check_mark: 사용 예시
if __name__ == "__main__":
    code = input("종목 코드를 입력하세요 (예: 005930): ").strip()
    start_date = input("시작 날짜를 입력하세요 (예: 2025.06.20): ").strip()
    end_date = input("끝 날짜를 입력하세요 (예: 2025.06.23): ").strip()

    df = get_all_posts_by_date_range(code, start_date, end_date)

    if not df.empty:
        print("\n=== 감성 분석 시작 ===")
        # 1. 감성 분석 적용
        sentiments = df['본문'].apply(analyze_sentiment_clova)
        df[['sentiment', 'sentiment_score']] = pd.DataFrame(sentiments.tolist(), index=df.index)
        
        print("...감성 분석 완료.\n")

        # 2. 날짜별 감성 지수 계산
        print("=== 날짜별 감성 지수 분석 ===")
        sentiment_map = {'positive': 1, 'neutral': 0, 'negative': -1}
        df['sentiment_val'] = df['sentiment'].map(sentiment_map).fillna(0)

        daily_sentiment = df.groupby('날짜').agg(
            positive_count=('sentiment', lambda s: (s == 'positive').sum()),
            negative_count=('sentiment', lambda s: (s == 'negative').sum()),
            neutral_count=('sentiment', lambda s: (s == 'neutral').sum()),
            total_posts=('sentiment', 'count')
        ).reset_index()

        daily_sentiment['sentiment_index'] = (
            (daily_sentiment['positive_count'] - daily_sentiment['negative_count']) / daily_sentiment['total_posts']
        ).round(2)
        
        print(daily_sentiment)
        
        # 3. 전체 결과 출력
        print("\n=== 개별 게시글 분석 결과 (상위 20개) ===")
        print(df[['날짜', '제목', 'sentiment', 'sentiment_score']].head(20))

    else:
        print("분석할 데이터가 없습니다.")