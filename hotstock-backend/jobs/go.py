from forum_collector import collect_forum_keywords
from news_collector import collect_news_keywords

def main():
    print("✅ 종토방 키워드 수집 시작...")
    collect_forum_keywords(10)
    print("👉 종토방 키워드 수집 완료")

    print("✅ 뉴스 키워드 수집 시작...")
    collect_news_keywords(10)
    print("👉 뉴스 키워드 수집 완료")

if __name__ == "__main__":
    main()