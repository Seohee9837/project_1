# 🔥 HOT 주식 분석 플랫폼

## 📋 프로젝트 개요

**커몽**은 주식 투자자들을 위한 종합적인 주식 분석 도구입니다. 주가 정보, 커뮤니티 키워드 분석, 기술적 지표, 재무 정보 등을 제공하여 투자 결정을 지원합니다.

### 🎯 주요 기능
- **주가 모니터링**: 현재가, 전일대비, 수익률 정보
- **커뮤니티 키워드 분석**: 종토방/뉴스 키워드 분석 및 구글 트렌드 연동
- **기술적 분석**: 주가 차트, 이동평균선, RSI 등 보조지표
- **재무 정보**: 재무제표, ESG 정보, 투자자보고서
- **기업 검색**: 종목명/기업명으로 빠른 검색

## 🏗️ 프로젝트 구조

```
project_1/
├── hotstock-backend/          # 백엔드 서버 (FastAPI)
│   ├── main.py               # FastAPI 앱 진입점 및 CORS 설정
│   ├── routers/              # API 라우터
│   │   └── stock.py         # 주식 관련 API 엔드포인트
│   ├── services/             # 비즈니스 로직 서비스
│   │   ├── stock_service.py # 메인 서비스 (주가, 검색, 페이지 데이터)
│   │   ├── indicators.py    # 기술적 지표 계산 (RSI, 이동평균선)
│   │   ├── price_chart.py   # 주가 차트 데이터 처리
│   │   ├── multiples.py     # PER, PBR 등 배수 계산
│   │   ├── reports.py       # 투자자보고서 정보
│   │   └── gg_trend.py      # 구글 트렌드 데이터
│   ├── jobs/                 # 백그라운드 데이터 수집 작업
│   │   ├── forum_collector.py # 종목토론방 키워드 수집
│   │   ├── news_collector.py  # 뉴스 키워드 수집
│   │   ├── scheduler.py       # 작업 스케줄러
│   │   └── go.py             # 데이터 수집 실행 스크립트
│   └── data/                 # 데이터 파일 (CSV, JSON)
├── front/                    # 프론트엔드 (React + TypeScript)
│   ├── src/
│   │   ├── pages/           # 페이지 컴포넌트
│   │   │   ├── index.tsx    # 메인 페이지
│   │   │   ├── info.tsx     # 상세 정보 페이지
│   │   │   └── opinion.tsx  # 커뮤니티 의견 페이지
│   │   ├── components/      # 재사용 컴포넌트
│   │   └── styles/          # 스타일 파일
│   ├── package.json         # 의존성 관리
│   └── vite.config.ts       # Vite 설정
└── README.md                # 프로젝트 문서
```

## 🛠️ 기술 스택

### Backend
- **FastAPI**: 현대적이고 빠른 Python 웹 프레임워크
- **Python 3.10**: 메인 프로그래밍 언어
- **Uvicorn**: ASGI 서버
- **CORS**: 크로스 오리진 리소스 공유 지원
- **FinanceDataReader**: 한국 주식 데이터 수집
- **Pandas**: 데이터 처리 및 분석
- **OpenAI GPT-4**: 키워드 필터링 및 분석
- **BeautifulSoup**: 웹 스크래핑
- **Newspaper3k**: 뉴스 기사 텍스트 추출

### Frontend
- **React 19**: 사용자 인터페이스 라이브러리
- **TypeScript**: 타입 안전성을 위한 JavaScript 확장
- **Vite**: 빠른 개발 서버 및 빌드 도구
- **React Router**: 클라이언트 사이드 라우팅
- **Recharts**: 데이터 시각화 차트 라이브러리
- **React Icons**: 아이콘 라이브러리

## 🔧 백엔드 상세 구조

### 📁 Services (비즈니스 로직)
백엔드의 핵심 비즈니스 로직을 담당하는 서비스 레이어입니다.

#### `stock_service.py` - 메인 서비스
- **실시간 주가 정보**: 현재가, 전일대비, 수익률 계산
- **기업 검색**: 종목명/기업명 기반 자동완성 기능
- **포럼 페이지 데이터**: 종토방/뉴스 키워드 + 구글 트렌드 통합
- **상세 페이지 데이터**: 주가 차트, 지표, 재무, ESG, 보고서 통합

#### `indicators.py` - 기술적 지표
- **RSI (Relative Strength Index)**: 과매수/과매도 구간 분석
- **이동평균선**: 20일선, 60일선 골든크로스/데드크로스 감지
- **차트 데이터**: 주가와 보조지표 통합 차트 데이터 생성

#### `price_chart.py` - 주가 차트
- **주가 데이터**: FinanceDataReader를 통한 실시간 주가 수집
- **차트 포맷**: 프론트엔드 차트 라이브러리 호환 데이터 구조

#### `multiples.py` - 배수 계산
- **PER, PBR, ROE**: 기업 가치 평가 지표 계산
- **재무 비율**: 투자자 관점의 핵심 재무 지표

#### `reports.py` - 보고서 관리
- **투자자보고서**: 최신 IR 자료 수집 및 관리
- **PDF 링크**: 보고서 다운로드 링크 제공

#### `gg_trend.py` - 구글 트렌드
- **트렌드 데이터**: 구글 트렌드 API 연동
- **키워드 분석**: 기업명 기반 검색 트렌드 분석

### 📁 Jobs (백그라운드 작업)
정기적인 데이터 수집 및 처리를 담당하는 백그라운드 작업입니다.

#### `forum_collector.py` - 종목토론방 수집기
- **웹 스크래핑**: 네이버 종목토론방 게시글 수집
- **키워드 추출**: 게시글에서 핵심 키워드 추출
- **GPT 필터링**: OpenAI GPT-4를 통한 키워드 정제
- **감정 분석**: 투자자 커뮤니티 감정 분석

#### `news_collector.py` - 뉴스 수집기
- **네이버 뉴스 API**: 기업 관련 뉴스 검색
- **기사 본문 추출**: Newspaper3k를 통한 텍스트 추출
- **키워드 분석**: 뉴스 기사 핵심 키워드 추출
- **GPT 정제**: 의미 있는 키워드만 선별

#### `scheduler.py` - 작업 스케줄러
- **정기 실행**: 일일/주간 데이터 수집 작업 스케줄링
- **작업 관리**: 백그라운드 작업 상태 관리

### 📁 Routers (API 엔드포인트)
RESTful API 엔드포인트를 정의하는 라우터 레이어입니다.

#### `stock.py` - 주식 API
- **검색 API**: 기업명/종목명 검색
- **주가 API**: 실시간 주가 정보
- **포럼 API**: 커뮤니티 데이터 (종토방/뉴스 키워드 + 구글 트렌드)
- **상세 API**: 종합 분석 데이터 (차트, 기술적 지표, 재무, ESG, 보고서)

## 🚀 실행 방법

### Backend 실행
```bash
cd project_1/hotstock-backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend 실행
```bash
cd project_1/front
npm install
npm run dev
```

### 데이터 수집 작업 실행 (선택사항)
```bash
cd project_1/hotstock-backend/jobs
python go.py  # 종목토론방 및 뉴스 데이터 수집
```

## 📡 API 엔드포인트

### Base URL: `http://localhost:8000`

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/` | GET | 서버 상태 확인 |
| `/company/search` | GET | 기업 검색 (자동완성) |
| `/company/{ticker}/current-price` | GET | 실시간 주가 정보 |
| `/company/{ticker}/forum-data` | GET | 커뮤니티 데이터 (종토방/뉴스 키워드 + 구글 트렌드) |
| `/company/{ticker}/detail-data` | GET | 상세 정보 (차트, 기술적 지표, 재무, ESG, 보고서) |

## 📊 주요 페이지

### 1. 메인 페이지 (`/`)
- 기업 검색 기능

### 2. 상세 정보 페이지 (`/info`)
- 주가 차트 및 기술적 지표
- 재무 정보 및 ESG 데이터
- 투자자보고서 정보

### 3. 커뮤니티 의견 페이지 (`/opinion`)
- 종토방 키워드 분석
- 뉴스 감정 분석
- 구글 트렌드 연동

## 🔧 개발 환경 설정

### 필수 요구사항
- Python 3.10+
- Node.js 18+
- npm 또는 yarn

### 설치된 주요 패키지
```bash
# Backend
pip install fastapi uvicorn pykrx pandas numpy matplotlib
pip install openai beautifulsoup4 newspaper3k fake-useragent
pip install requests tqdm python-dotenv

# Frontend
npm install react react-dom typescript vite
```

## 📈 프로젝트 특징

1. **실시간 데이터**: 주가 정보를 실시간으로 업데이트
2. **감정 분석**: 커뮤니티와 뉴스 데이터의 감정 분석 제공
3. **시각화**: 직관적인 차트와 그래프로 데이터 표현
4. **반응형 디자인**: 다양한 디바이스에서 최적화된 사용자 경험
5. **확장 가능한 구조**: 모듈화된 코드로 유지보수 및 기능 확장 용이
6. **AI 기반 분석**: GPT-4를 활용한 키워드 필터링 및 분석
7. **자동화된 데이터 수집**: 정기적인 웹 스크래핑 및 데이터 업데이트

## 🤝 기여 방법

1. 프로젝트를 포크합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

**🔥 HOT 주식 분석 플랫폼**으로 더 나은 투자 결정을 내려보세요!