import  requests
from bs4 import BeautifulSoup as bs
from tqdm import tqdm #현재 크롤링 상황 체크
from fake_useragent import UserAgent
import datetime

def parse_date(date_str):
    """날짜 문자열을 datetime 객체로 변환합니다."""
    try:
        # "2025.06.25" 형식을 파싱
        return datetime.datetime.strptime(date_str, "%Y.%m.%d")
    except ValueError:
        return None

def is_date_older_or_equal(current_date_str, target_date_str):
    """현재 날짜가 목표 날짜보다 과거이거나 같은지 확인합니다."""
    current_date = parse_date(current_date_str)
    target_date = parse_date(target_date_str)
    
    if current_date is None or target_date is None:
        return False
    
    return current_date <= target_date

def dfinder(start_date, end_date, stock_code):
    find_first_date = False
    find_end_date = False
    crawled_url_4_date = []
    start_date_page = None
    end_date_page = None
    
    print(f"{start_date}에서 {end_date} 날짜를 찾습니다.")
    
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
        
        # 더 구체적인 날짜 선택자 사용
        date_crawling = html.select('span.tah.p10.gray03') #span 태그와 함께 명시
        title_parsing = html.select('.title')

        # 첫 번째 페이지 디버깅
        if t == 1:
            print(f"\n🔍 첫 번째 페이지 디버깅:")
            print(f"URL: {url}")
            print(f"Response status: {response.status_code}")
            print(f"날짜 요소 개수: {len(date_crawling)}")
            print(f"제목 요소 개수: {len(title_parsing)}")
            print("발견된 모든 날짜:")
            for i, date_elem in enumerate(date_crawling[:10]):  # 처음 10개만 출력
                print(f"  {i+1}: '{date_elem.text.strip()}'")
            print("발견된 모든 제목:")
            for i, title_elem in enumerate(title_parsing[:5]):  # 처음 5개만 출력
                title_text = title_elem.text.strip() if title_elem.text else "제목 없음"
                print(f"  {i+1}: '{title_text}'")

        #.title 클래스에서 a.href 속성값만 추출
        # 시작 날짜와 끝 날짜를 독립적으로 찾기
        for n in date_crawling:
            check = n.text.strip()
            # 디버깅: 첫 번째 페이지의 모든 날짜 출력
            if t == 1:
                print(f"페이지 {t}에서 발견한 날짜: {check}")
            # 디버깅: 첫 몇 페이지의 날짜 출력
            elif t <= 5:
                print(f"페이지 {t}에서 발견한 날짜: {check}")
            
            # 시작 날짜 찾기
            if not find_first_date and start_date in check:
                start_date_page = t
                find_first_date = True
                print(f"\n{start_date}를 {start_date_page}페이지에서 찾았습니다.")
            
            # 끝 날짜 찾기 - 정확히 일치하거나 더 과거인 날짜가 나오면 중단
            if not find_end_date:
                # 정확히 일치하는 경우
                if end_date in check:
                    end_date_page = t
                    find_end_date = True
                    print(f"\n{end_date}를 {end_date_page}페이지에서 찾았습니다.")
                # 더 과거인 날짜가 나온 경우
                elif is_date_older_or_equal(check, end_date):
                    end_date_page = t
                    find_end_date = True
                    print(f"\n{check} (목표: {end_date}보다 과거)를 {end_date_page}페이지에서 찾았습니다.")
        
        # URL 수집 (시작 날짜를 찾은 후에만)
        if find_first_date and not find_end_date:
            for n in title_parsing:
                if n.a and n.a.get("href"):  # n.a가 존재하고 href 속성이 있는지 확인
                    crawled_url_4_date.append(n.a["href"])
        
        # 두 날짜를 모두 찾았으면 종료
        if find_first_date and find_end_date:
            break
            
        # 1000페이지까지 검색했는데 못 찾으면 종료
        if t >= 1000:
            print(f"\n⚠️ 1000페이지까지 검색했지만 모든 날짜를 찾지 못했습니다.")
            print(f"시작 날짜 ({start_date}) 찾음: {find_first_date}")
            print(f"끝 날짜 ({end_date}) 찾음: {find_end_date}")
            break
                
    return start_date_page, end_date_page, crawled_url_4_date #날짜에 맞는 페이지 리턴


if __name__ == "__main__":
    start, end, url = dfinder("2023.12.11", "2023.12.10", "005930")
    print(start, end, url)