from fastapi import APIRouter, Query
from services.stock_service import (
    get_forum_page_data,
    get_detail_page_data,
    search_company
)

router = APIRouter()

@router.get("/search")
def search_companies(query: str = Query(..., min_length=1)):
    return search_company(query)

@router.get("/{ticker}/forum-data")
def forum_data(ticker: str):
    """
    Page2용: 종토방/뉴스 키워드 + 구글 트렌드
    """
    return get_forum_page_data(ticker)

@router.get("/{ticker}/detail-data")
def detail_data(ticker: str):
    """
    Page3용: 주가 차트, 보조지표, 재무/ESG/보고서 정보
    """
    return get_detail_page_data(ticker)
