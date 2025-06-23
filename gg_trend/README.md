🔧 기능 개요
📤 기업 티커 입력 → .csv 파일에서 기업명 검색어 자동 매칭

📅 시작일은 현재 날짜, 종료일은 1년 전 자동 설정

🔍 NAVER 데이터랩 검색 API를 활용해 일간 검색량 수집

📊 Pandas DataFrame으로 변환하여 분석 및 시각화에 활용 가능


📂 프로젝트 구조
.
├── main.py                  # 실행 파일 (입력 → 트렌드 추출 실행)
├── trend_api.py             # 트렌드 수집 및 전처리 함수 정의
├── company_utils.py         # 기업명 매칭 유틸 함수
├── config.py                # 환경변수 로딩 및 기본 설정
├── .env                     # NAVER API 키 저장용 (비공개)
├── company_with_corp_code.csv  # 기업명-티커 매칭용 csv 파일
├── requirements.txt         # 필요한 라이브러리 목록
└── README.md                # 프로젝트 설명

⚙️ 실행 방법
1. 환경 세팅
pip install -r requirements.txt

2. .env 파일 생성
NAVER_CLIENT_ID=your_client_id
NAVER_CLIENT_SECRET=your_client_secret

3. 실행
python main.py
입력: 티커(symbol) → 예: A005930

자동으로 기업명 매칭 → 검색량 수집 시작

📈 예시 출력
[입력] 티커를 입력하세요: A005930
[결과] 기업명: 삼성전자
[INFO] 2023-06-18 ~ 2024-06-18 검색량 수집 중...
           ratio
period           
2023-06-18   15.2
2023-06-19   17.8
...