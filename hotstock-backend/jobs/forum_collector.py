from datetime import datetime, timedelta
import os
import re
import requests
import pandas as pd
from bs4 import BeautifulSoup as bs
from tqdm import tqdm
from collections import Counter
from openai import OpenAI
from fake_useragent import UserAgent
from openpyxl.cell.cell import ILLEGAL_CHARACTERS_RE
from dotenv import load_dotenv

load_dotenv()

# 날짜 자동 설정: 어제 ~ 그저께
today = datetime.now()
start_date = (today - timedelta(days=1)).strftime('%Y.%m.%d')
end_date = (today - timedelta(days=2)).strftime('%Y.%m.%d')
# GPT API 클라이언트 설정
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai_client = OpenAI(api_key=OPENAI_API_KEY)

# 게시글 URL 수집기
def dfinder(start_date, end_date, stock_code):
    """
    ✅ start_date ~ end_date에 해당하는 게시글 URL만 수집
    ✅ 페이지 내에서 end_date보다 이전 날짜가 등장하면 해당 페이지까지만 수집하고 종료
    """
    crawled_urls = []
    dt_start = datetime.strptime(start_date, "%Y.%m.%d")
    dt_end = datetime.strptime(end_date, "%Y.%m.%d")

    for t in tqdm(range(1, 100084)):
        url = f'https://finance.naver.com/item/board.naver?code={stock_code}&page={t}'
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        }

        try:
            response = requests.get(url, headers=headers, timeout=10)
            html = bs(response.text, 'html.parser')
            date_elements = html.select('.tah.p10.gray03')
            title_elements = html.select('.title')

            page_has_valid_date = False
            should_stop = False

            for n in date_elements:
                match = re.search(r'\d{4}\.\d{2}\.\d{2}', n.text)
                if not match:
                    continue
                post_date = datetime.strptime(match.group(), "%Y.%m.%d")

                if dt_end <= post_date <= dt_start:
                    page_has_valid_date = True
                elif post_date < dt_end:
                    should_stop = True

            # ✅ 수집은 29일 게시글만 (혹은 범위 내 게시글만)
            if page_has_valid_date:
                for n in title_elements:
                    if n.a and n.a.get("href"):
                        href = n.a["href"]
                        if href.startswith("/item/board_read"):
                            crawled_urls.append("https://finance.naver.com" + href)

            if should_stop:
                print(f"🛑 {stock_code}: {end_date} 이전 날짜 발견 → 종료.")
                break

        except Exception as e:
            print(f"❌ 페이지 {t} 에러: {e}")
            continue

    return crawled_urls

# 게시글 본문/제목/날짜 수집기
def CWBS(url_list, stock_code, target_date):
    date_list, title_list, content_list = [], [], []
    for url in tqdm(url_list):
        try:
            user_agent = UserAgent()
            headers = {
                'Referer': f'https://finance.naver.com/item/board.naver?code={stock_code}',
                'User-Agent': user_agent.random
            }
            response = requests.get(url=url, headers=headers)
            html = bs(response.text, 'html.parser')

            date = html.select_one('.gray03.p9.tah')
            title = html.select_one('.c.p15')
            content = ""
            for selector in ['.view_se', '.se-main-container', '.se-component-content', '.post_content']:
                content_element = html.select_one(selector)
                if content_element:
                    content = content_element.get_text(strip=True)
                    break
            if not (date and title and content):
                continue

            date_text = date.text[:10]

            if date_text != target_date:  # ✅ 29일이 아닌 게시글은 제외
                continue

            title_text = ILLEGAL_CHARACTERS_RE.sub(r'', title.text.replace("#", "").replace("[", "").replace("]", ""))
            content_text = ILLEGAL_CHARACTERS_RE.sub(r'', content.replace("\n", " ").replace("\r", " ").replace("\t", " "))
            date_list.append(date_text)
            title_list.append(title_text)
            content_list.append(content_text)
        except:
            continue
    return pd.DataFrame({'date': date_list, 'title': title_list, 'content': content_list})

# 키워드 추출 함수
def extract_keywords_from_text(text):
    text = re.sub(r'\s+', ' ', text)
    korean_words = re.findall(r'[가-힣]{2,}', text)
    english_words = re.findall(r'\b[a-zA-Z]{3,}\b', text)
    number_korean = re.findall(r'\d+[가-힣]+', text)
    special_patterns = re.findall(r'[가-힣]+(?:률|자|성|력|감|도|형|적|화)', text)
    return korean_words + english_words + number_korean + special_patterns

# GPT 필터링
def filter_keywords_with_gpt(top_keywords, stock_code):
    keyword_list = [f"{word}({freq}회)" for word, freq in top_keywords]
    keyword_str = ", ".join(keyword_list)
    prompt = f"""
다음은 {stock_code} 종목 관련 종목토론방 게시글에서 추출한 상위 키워드 목록입니다. 
종목토론방의 생생한 여론을 전달하기 위해 다음 기준으로 키워드를 선별해주세요(상위 20개):

✅ 포함해야 할 것들:
- 비속어, 인터넷용어, 신조어
- 다른 기업명
- 주식 관련 전문용어
- 투자자 감정 표현
- 시장 동향 키워드
- 실적, 뉴스, 이벤트 관련 키워드

❌ 제거해야 할 것들:
- 조사, 접속사, 일반 동사/형용사
- 시간 표현
- 정도 표현
- 해당 기업명

키워드 목록: {keyword_str}

다음 형식으로 응답해주세요:
1. 키워드명(횟수회)
2. 키워드명(횟수회)
...
"""
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "당신은 종목토론방 여론 분석 전문가입니다."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print("GPT 오류:", e)
        return ""

# 분석 실행
def run_analysis(stock_code):
    print(f"📌 실행 날짜 기준: start_date={start_date}, end_date={end_date}")
    url_list = dfinder(start_date, end_date, stock_code)  # 🔁 end_date도 전달
    if not url_list:
        print("❌ URL 없음")
        return

    df = CWBS(url_list, stock_code, start_date)  # ✅ start_date 기준 필터링 유지
    if df.empty:
        print("❌ 해당 날짜 게시글 없음")
        return

    all_text = " ".join(df['title'] + " " + df['content'])
    all_words = extract_keywords_from_text(all_text)
    top_words = Counter(all_words).most_common(100)
    filtered = filter_keywords_with_gpt(top_words[:50], stock_code)

    keywords = re.findall(r'\d+\.\s*(.+?\(\d+회\))', filtered)
    keywords = keywords[:20]

    result_df = pd.DataFrame([[stock_code] + keywords], columns=['ticker'] + [f"keyword{i+1}" for i in range(len(keywords))])
    return result_df

def collect_forum_keywords(limit=3):
    try:
        ticker_df = pd.read_csv("../data/2024_final_ticker_list.csv", dtype={"ticker": str})
        if 'ticker' not in ticker_df.columns:
            raise ValueError("❌ 'ticker' 컬럼이 CSV에 없습니다.")
        test_tickers = ticker_df['ticker'].dropna().unique().tolist()
        print("📄 추출된 티커 목록 (일부):", test_tickers[:limit])
    except Exception as e:
        print(f"❌ CSV 로드 오류: {e}")
        return None

    final_df = pd.DataFrame()
    tried = 0

    for ticker in test_tickers:
        if limit is not None and tried >= limit:
            break
        tried += 1
        try:
            print(f"\n🚀 {ticker} 처리 시작")
            result_df = run_analysis(ticker)
            if result_df is not None:
                final_df = pd.concat([final_df, result_df], ignore_index=True)
        except Exception as e:
            print(f"❌ {ticker} 처리 중 오류: {e}")

    if not final_df.empty:
        os.makedirs("data", exist_ok=True)
        final_df.to_csv("../data/forums.csv", index=False, encoding="utf-8-sig")
        print("\n✅ 누적 결과 저장 완료: data/forums.csv")
        return final_df
    else:
        print("⚠️ 결과가 없어 저장하지 않았습니다.")
        return None

