import schedule
import time
from jobs.forum_collector import collect_forum_keywords
from jobs.news_collector import collect_news_keywords

def job():
    print("🕛 자정 작업 시작")
    collect_forum_keywords()
    collect_news_keywords()
    print("✅ 모든 수집 완료")

# 매일 자정 실행
schedule.every().day.at("00:00").do(job)

while True:
    schedule.run_pending()
    time.sleep(1)
