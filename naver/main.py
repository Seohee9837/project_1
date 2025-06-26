import crawler_bs4
import date_finder


print("종목코드를 입력하세요 (예: 005930): ", end="")
stock_code = input()

print("찾고자 하는 기간을 입력하시오.")

print("시작날짜 (예: 2023.12.11): ", end="")
start_date = input()

print("끝날짜 (예: 2023.12.15): ", end="")
end_date = input()

start, end, url = date_finder.dfinder(start_date, end_date, stock_code)
print(f"{start}에서 {end} 페이지 까지")

crawler_bs4.CWBS(start, end, url, start_date, end_date, stock_code, start_date) #crawler_bs4파일의 CWBS함수에 전달
    
print("크롤링 끝 \n")