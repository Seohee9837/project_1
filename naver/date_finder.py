import  requests
from bs4 import BeautifulSoup as bs
from tqdm import tqdm #현재 크롤링 상황 체크
from fake_useragent import UserAgent
 
def dfinder(start_date, end_date, stock_code):
    find_first_date = False
    find_end_date = False
    crawled_url_4_date = []
    print(f"{start_date}에서 까지의 {end_date} 날짜를 찾습니다.")
    #크롤러
    for t in tqdm(range(1, 100084)):
        url = f'https://finance.naver.com/item/board.naver?code={stock_code}&page={t}'#접속 링크
        user_agent = UserAgent()#fake_useragent함수, useragent 렌덤값 설정하기 위해 UserAgent()불러옴
        if(t <= 99): #99페이지 전까지는 참조할 필요 없음, 오히려 참조하면 접속 불가
            headers = {
                'User-Agent': user_agent.random #랜덤 agent 설정
            }
        else: #1페이지 이후 참조
            headers = {
                'Referer': f'https://finance.naver.com/item/board.naver?code={stock_code}&page={t-1}', #Referer를 이용해서 다음 링크로 들어가기 전에 참조, 원래 100페이지 이후부터 참조 필요한데 굳이?
                'User-Agent' : user_agent.random #랜덤 agent 설정
                }
        
        response = requests.get(url = url, headers = headers) #url접속
        #print(response) # 접속 확인 (200 = 성공)
        html_text = response.text #response에서 html값 텍스트만 가져오기
        html = bs(html_text, 'html.parser') #beautifulsoup로 HTML 문서를 파싱
        date_crawling = html.select('.tah.p10.gray03') #파싱된 문서에서 .tah p10 gray03 클래스 전부 찾기 , 추천 비추천 포함이기는 하나 날짜로 찾을 것이기에 문제 없음
        title_parsing = html.select('.title')

        
        #.title 클래스에서 a.href 속성값만 추출
        if find_first_date == False:
            for n in date_crawling:
                check = n.text.strip()
                # 디버깅: 첫 몇 페이지의 날짜 출력
                if t <= 3:
                    print(f"페이지 {t}에서 발견한 날짜: {check}")
                if start_date in check:
                    start_date_page = t
                    find_first_date = True
                    print(f"\n{start_date}를 {start_date_page}페이지에서 찾았습니다.")
                    break
        
        if find_first_date == True:
            if find_end_date == False:
                for n in title_parsing:
                    if n.a and n.a.get("href"):  # n.a가 존재하고 href 속성이 있는지 확인
                        crawled_url_4_date.append(n.a["href"])
                for n in date_crawling:
                    check = n.text.strip()
                    if end_date in check:
                        end_date_page = t
                        find_end_date = True
                        print(f"\n{end_date}를 {end_date_page}페이지에서 찾았습니다.")
                        break
            
        if find_first_date == True:
            if find_end_date == True:
                break
            
                
                
    return start_date_page, end_date_page, crawled_url_4_date #날짜에 맞는 페이지 리턴


if __name__ == "__main__":
    start, end, url = dfinder("2023.12.11", "2023.12.10", "005930")
    print(start, end, url)