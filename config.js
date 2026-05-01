// API 키 및 설정
// 사용자가 직접 API 키를 발급받아 입력해야 합니다

const CONFIG = {
    // FRED API (Federal Reserve Economic Data)
    // 발급: https://fred.stlouisfed.org/docs/api/api_key.html
    FRED_API_KEY: '728209a09d6bd9b910fc13a559766c68',

    // Google Cloud Translation API
    // 발급: https://cloud.google.com/translate/docs/setup
    GOOGLE_TRANSLATE_API_KEY: 'AIzaSyDT72ZE4uajNIfnsRaReCtqMsjg2rN2gfQ',

    // Alpha Vantage API
    // 발급: https://www.alphavantage.co/support/#api-key
    ALPHA_VANTAGE_API_KEY: 'DJHMQXSKOEA8SEBD',

    // 데이터 캐싱 설정 (밀리초)
    CACHE_DURATION: 60 * 60 * 1000, // 1시간

    // 환율 데이터 기간
    EXCHANGE_RATE_DAYS: 30, // 최근 30일

    // 그래프 색상
    CHART_COLORS: {
        USD: '#2563eb',      // 파란색
        EUR: '#10b981',      // 초록색
        GBP: '#f59e0b',      // 주황색
        JPY: '#ef4444',      // 빨간색
        DXY: '#8b5cf6',      // 보라색
        KRW_INDEX: '#06b6d4' // 청록색
    }
};
