import os
import requests
from bs4 import BeautifulSoup as bs
import time
import pandas as pd
import datetime
from tqdm import tqdm
import fake_useragent #pyinstaller 사용 불가 우씨...
from openpyxl.cell.cell import ILLEGAL_CHARACTERS_RE
import re
from collections import Counter

#정적 크롤러
def CWBS(page_start, page_end, url, start_date, end_date, stock_code, target_date):
    error_count = 0 #관리자 삭제 링크 수 세기

    #data 폴더 존재 확인 및 생성
    data_folder = 'data'
    if not os.path.exists(data_folder):
        os.makedirs(data_folder)
        print("data 폴더 생성")

    #로그 파일 존재 확인
    log_file_name = 'log.txt'
    if os.path.isfile(log_file_name):
        print("log 파일 존재")
    else:
        f = open("log.txt", 'w')
        f.close()
        print("로그파일 생성")

    #크롤링 시작 log에 출력
    file = open("log.txt", "a", encoding="UTF-8")
    file.write(f"\n---------------------------------\n 정적 크롤링 시작\n 시작 페이지: {page_start}, 마지막 페이지: {page_end}\n")
    file.close()

    start_time = time.time()
    #필요 리스트
    date_list = [] #날짜
    title_list = [] #제목
    content_list = [] #본문
    url_list = [] #크롤링된 url

    #크롤링 시작
    print("데이터 수집 시작")
    for url_p in tqdm(url):
        try: #관리자 삭제 링크 생기면 except 실행 후 다음 링크 크롤링
            user_agent = fake_useragent.UserAgent()
            headers = {
                    'Referer': f'https://finance.naver.com/item/board.naver?code={stock_code}',
                    'User-Agent': user_agent.random
                }
            url = "https://finance.naver.com" + url_p #링크에 item 뒷부분만 포함되어있기에 앞부분 추가
            response_url_html = requests.get(url=url, headers=headers) #링크 요청
            url_html_text = response_url_html.text #받은 json파일에서 text값만 추출
            html = bs(url_html_text, 'html.parser') #html 파싱

            #요소 접근
            date_element = html.select_one('.gray03.p9.tah')
            if not date_element:
                print(f"날짜 요소를 찾을 수 없습니다: {url}")
                error_count += 1
                continue
            date = date_element.text
            
            #본문 크롤링 - 여러 선택자 시도
            content = ""
            content_selectors = ['.view_se', '.se-main-container', '.se-component-content', '.post_content']
            for selector in content_selectors:
                content_element = html.select_one(selector)
                if content_element:
                    content_not_cleaned = content_element.get_text(strip=True)
                    content = content_not_cleaned
                    break
            
            #본문 텍스트 정리
            if content:
                content = content.replace("\n", " ").replace("\r", " ").replace("\t", " ")
                content = " ".join(content.split())  # 연속된 공백 제거
                content = ILLEGAL_CHARACTERS_RE.sub(r'', content)
            else:
                content = "본문을 가져올 수 없습니다."
            
            title_element = html.select_one('.c.p15')
            if not title_element:
                print(f"제목 요소를 찾을 수 없습니다: {url}")
                error_count += 1
                continue
            title_not_cleaned = title_element.text
            title = title_not_cleaned.replace("#", "").replace("■", "").replace("[", "").replace("]", "") #제목에서 특수문자 제거
            title = ILLEGAL_CHARACTERS_RE.sub(r'', title)

            #크롤링한 요소 리스트에 담기
            date_list.append(date[:10]) #year, month, day만 크롤링
            title_list.append(title)
            content_list.append(content)
            url_list.append(url) #디버깅용 url
            
        except Exception as e:
            print(f"게시글 크롤링 중 에러 발생: {url}")
            print(f"에러 내용: {str(e)}")
            error_count += 1
            continue

    #dataframe 생성 후 크롤링 한 것들 전부 담기
    df = pd.DataFrame()
    df['date'] = date_list
    df['title'] = title_list
    df['content'] = content_list
    df['url'] = url_list

    # 해당 날짜만 필터링
    filtered_df = df[df['date'] == target_date]
    print(f"전체 크롤링 데이터: {len(df)}개")
    print(f"필터링된 데이터 ({target_date}): {len(filtered_df)}개")

    #CSV로 저장 (필터링된 데이터만)
    filtered_df.to_csv(f"data/{stock_code}_{target_date}_filtered.csv", index = False, sep='\t')
    
    # 키워드 분석 실행
    extract_top_keywords(filtered_df, stock_code, target_date)
    
    # 통계 파일 생성
    create_statistics_file(stock_code, target_date, len(df), len(filtered_df), error_count, start_date, end_date)
    
    #디버깅용 시간 체크
    end_time = time.time()
    sec = (end_time - start_time)
    result_t = str(datetime.timedelta(seconds=sec)).split(".") #소수점 이후로 자르기
    print(f"시간 : {result_t[0]}") #잘린 소수점은 [1]
    file = open("log.txt", "a", encoding="UTF-8") #마무리 로그
    file.write(f"걸린 시간 : {result_t[0]}, error_count : {error_count}")
    file.close()

def create_statistics_file(stock_code, target_date, total_crawled, filtered_count, error_count, start_date, end_date):
    """크롤링 통계 정보를 저장하는 파일을 생성합니다."""
    current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    stats_content = f"""네이버 금융 게시글 크롤링 통계
==========================================
생성 시간: {current_time}
종목 코드: {stock_code}
검색 기간: {start_date} ~ {end_date}
대상 날짜: {target_date}

크롤링 결과:
- 전체 크롤링된 게시글 수: {total_crawled:,}개
- 필터링된 게시글 수 ({target_date}): {filtered_count:,}개
- 에러 발생 수: {error_count:,}개
- 성공률: {((total_crawled - error_count) / total_crawled * 100):.1f}% (에러 제외)

파일 저장 위치:
- 필터링된 데이터: data/{stock_code}_{target_date}_filtered.csv
- 로그 파일: log.txt

=========================================="""
    
    # 통계 파일 저장
    stats_filename = f"data/{stock_code}_{target_date}_statistics.txt"
    with open(stats_filename, "w", encoding="UTF-8") as f:
        f.write(stats_content)
    
    print(f"\n📊 크롤링 통계가 저장되었습니다: {stats_filename}")
    print(f"총 크롤링된 게시글 수: {total_crawled:,}개")
    print(f"필터링된 게시글 수: {filtered_count:,}개")

def extract_top_keywords(df, stock_code, target_date):
    """크롤링된 데이터에서 가장 많이 언급된 단어 10개를 추출합니다."""
    # 제목과 본문을 합쳐서 분석
    all_text = ""
    for _, row in df.iterrows():
        all_text += str(row['title']) + " " + str(row['content']) + " "
    
    # 한글 단어 추출 (2글자 이상)
    korean_words = re.findall(r'[가-힣]{2,}', all_text)
    
    # 불용어 목록 (제거할 단어들)
    stop_words = {
        '있습니다', '합니다', '입니다', '됩니다', '됩니다', '됩니다', '됩니다', '됩니다',
        '그리고', '하지만', '그런데', '또한', '또는', '그리고', '하지만', '그런데',
        '이것', '저것', '그것', '무엇', '어떤', '어떻게', '언제', '어디서',
        '오늘', '내일', '어제', '지금', '이제', '그때', '언제나',
        '매우', '너무', '정말', '진짜', '아주', '훨씬', '더욱',
        '보고', '있다', '없다', '하다', '되다', '이다', '있다', '없다',
        '이런', '저런', '그런', '어떤', '무슨', '어느', '몇',
        '때문', '위해', '통해', '따라', '관련', '대한', '있는', '없는',
        '하는', '되는', '있는', '없는', '하는', '되는', '있는', '없는',
        '있었다', '것이다'
    }
    
    # 불용어 제거
    filtered_words = [word for word in korean_words if word not in stop_words and len(word) >= 2]
    
    # 단어 빈도 계산
    word_counts = Counter(filtered_words)
    
    # 상위 10개 단어 추출
    top_10_words = word_counts.most_common(10)
    
    # 결과 출력
    print(f"\n🔍 {stock_code} 종목의 상위 키워드 10개 ({target_date})")
    print("=" * 50)
    for i, (word, count) in enumerate(top_10_words, 1):
        print(f"{i:2d}. {word:<10} - {count:3d}회 언급")
    
    # 키워드 파일 저장
    keyword_filename = f"data/{stock_code}_{target_date}_keywords.txt"
    with open(keyword_filename, "w", encoding="UTF-8") as f:
        f.write(f"{stock_code} 종목 상위 키워드 분석 ({target_date})\n")
        f.write("=" * 50 + "\n")
        f.write(f"총 게시글 수: {len(df)}개\n\n")
        f.write("상위 10개 키워드:\n")
        for i, (word, count) in enumerate(top_10_words, 1):
            f.write(f"{i:2d}. {word:<10} - {count:3d}회 언급\n")
    
    print(f"\n📝 키워드 분석 결과가 저장되었습니다: {keyword_filename}")
    print(f"총 게시글 수: {len(df)}개")
    
    return top_10_words