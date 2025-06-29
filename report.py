import requests
from bs4 import BeautifulSoup

def get_latest_reports(ticker):
    url = f"https://finance.naver.com/research/company_list.naver?searchType=itemCode&itemCode={ticker}"
    headers = {"User-Agent": "Mozilla/5.0"}
    res = requests.get(url, headers=headers)
    res.encoding = 'euc-kr'

    if res.status_code != 200:
        print("❌ 요청 실패")
        return []

    soup = BeautifulSoup(res.text, 'html.parser')
    table = soup.select_one("table.type_1")
    if not table:
        print("❌ 보고서 테이블을 찾을 수 없습니다.")
        return []

    rows = table.select("tr")[2:]
    reports = []

    for row in rows:
        tds = row.select("td")
        if len(tds) < 5:
            continue

        try:
            stock_td = row.select_one("td > a[href*='/item/main.naver']")
            stock_name = stock_td.get_text(strip=True) if stock_td else ""

            title = tds[1].get_text(strip=True)
            pdf_tag = tds[3].select_one("a")
            pdf_link = pdf_tag["href"] if pdf_tag else None
            company = tds[2].get_text(strip=True)
            date = tds[4].get_text(strip=True)

            reports.append({
                "종목명": stock_name,
                "제목": title,
                "증권사": company,
                "날짜": date,
                "PDF링크": pdf_link
            })
        except Exception as e:
            print("⚠️ 파싱 오류:", e)
            continue

    if not reports:
        return []

    latest_date = max(r["날짜"] for r in reports)
    latest_reports = [r for r in reports if r["날짜"] == latest_date]
    return latest_reports
