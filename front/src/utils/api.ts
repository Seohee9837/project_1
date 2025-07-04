const API_BASE_URL = 'http://127.0.0.1:8000';

export interface Company {
  ticker: string;
  corp_name: string;
}

export interface KeywordData {
  word: string;
  count: number;
}

export interface ForumData {
  corpName: string;
  forums: KeywordData[];
  news: KeywordData[];
  trend: any[];
}

export interface DetailData {
  price_chart: any[];
  indicator_chart: any[];
  indicators: any;
  financial_indicators: any;
  financial_states: any;
  esg: any;
  reports: any[];
  multiples: any;
}

export interface CurrentPriceData {
  current_price: string;
  change: string;
  change_rate: string;
  prev_close: string;
}

// API 호출 함수들
export const api = {
  // 회사 검색
  searchCompany: async (query: string): Promise<Company[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/company/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error('검색에 실패했습니다.');
      return await response.json();
    } catch (error) {
      console.error('회사 검색 오류:', error);
      return [];
    }
  },

  // 실시간 주가 정보
  getCurrentPrice: async (ticker: string): Promise<CurrentPriceData | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/company/${ticker}/current-price`);
      if (!response.ok) throw new Error('주가 정보를 가져오는데 실패했습니다.');
      return await response.json();
    } catch (error) {
      console.error('주가 정보 오류:', error);
      return null;
    }
  },

  // 여론 데이터 (포럼, 뉴스, 트렌드)
  getForumData: async (ticker: string): Promise<ForumData | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/company/${ticker}/forum-data`);
      if (!response.ok) throw new Error('여론 데이터를 가져오는데 실패했습니다.');
      return await response.json();
    } catch (error) {
      console.error('여론 데이터 오류:', error);
      return null;
    }
  },

  // 상세 데이터 (주가, 재무, ESG 등)
  getDetailData: async (ticker: string): Promise<DetailData | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/company/${ticker}/detail-data`);
      if (!response.ok) throw new Error('상세 데이터를 가져오는데 실패했습니다.');
      return await response.json();
    } catch (error) {
      console.error('상세 데이터 오류:', error);
      return null;
    }
  }
}; 