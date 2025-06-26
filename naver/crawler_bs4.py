import os
import requests
from bs4 import BeautifulSoup as bs
import time
import pandas as pd
import datetime
from tqdm import tqdm
import fake_useragent #pyinstaller 사용 불가 우씨...
from openpyxl.cell.cell import ILLEGAL_CHARACTERS_RE

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
    
    #디버깅용 시간 체크
    end_time = time.time()
    sec = (end_time - start_time)
    result_t = str(datetime.timedelta(seconds=sec)).split(".") #소수점 이후로 자르기
    print(f"시간 : {result_t[0]}") #잘린 소수점은 [1]
    file = open("log.txt", "a", encoding="UTF-8") #마무리 로그
    file.write(f"걸린 시간 : {result_t[0]}, error_count : {error_count}")
    file.close()