// 경제 지표 정의

const ECONOMIC_INDICATORS = [
    {
        id: 'gdp_growth',
        name: 'GDP Growth Rate',
        nameKo: 'GDP 성장률',
        description: 'Quarterly GDP growth rate showing economic expansion or contraction',
        descriptionKo: '분기별 GDP 성장률로 경제 확장 또는 수축을 나타냄',
        source: 'FRED',
        seriesId: 'A191RL1Q225SBEA',
        unit: '%',
        link: 'https://fred.stlouisfed.org/series/A191RL1Q225SBEA'
    },
    {
        id: 'cpi_inflation',
        name: 'CPI Inflation Rate',
        nameKo: 'CPI 인플레이션율',
        description: 'Consumer Price Index showing inflation rate',
        descriptionKo: '소비자 물가 지수로 인플레이션율을 나타냄',
        source: 'FRED',
        seriesId: 'CPIAUCSL',
        unit: '%',
        link: 'https://fred.stlouisfed.org/series/CPIAUCSL'
    },
    {
        id: 'unemployment_rate',
        name: 'Unemployment Rate',
        nameKo: '실업률',
        description: 'Unemployment rate as percentage of labor force',
        descriptionKo: '노동력 대비 실업률',
        source: 'FRED',
        seriesId: 'UNRATE',
        unit: '%',
        link: 'https://fred.stlouisfed.org/series/UNRATE'
    },
    {
        id: 'fed_funds_rate',
        name: 'Federal Funds Rate',
        nameKo: 'Fed 기준금리',
        description: 'Federal Reserve target interest rate',
        descriptionKo: '연방준비제도 목표 금리',
        source: 'FRED',
        seriesId: 'FEDFUNDS',
        unit: '%',
        link: 'https://fred.stlouisfed.org/series/FEDFUNDS'
    },
    {
        id: 'treasury_10y',
        name: '10-Year Treasury Yield',
        nameKo: '10년물 국채 금리',
        description: '10-year US Treasury bond yield',
        descriptionKo: '10년물 미국 국채 금리',
        source: 'FRED',
        seriesId: 'DGS10',
        unit: '%',
        link: 'https://fred.stlouisfed.org/series/DGS10'
    },
    // Alpha Vantage 지표들은 무료 API 제한으로 인해 일시 비활성화
    /*
    {
        id: 'vix',
        name: 'VIX Index',
        nameKo: 'VIX 변동성 지수',
        description: 'CBOE Volatility Index measuring market volatility',
        descriptionKo: '시장 변동성을 측정하는 CBOE 변동성 지수',
        source: 'Alpha Vantage',
        symbol: 'VIX',
        unit: '',
        link: 'https://www.cboe.com/us/indices/dashboard/vix/'
    },
    {
        id: 'nasdaq',
        name: 'Nasdaq Composite',
        nameKo: '나스닥 종합지수',
        description: 'Nasdaq Composite Index tracking technology stocks',
        descriptionKo: '기술주를 추적하는 나스닥 종합지수',
        source: 'Alpha Vantage',
        symbol: '^IXIC',
        unit: '',
        link: 'https://www.nasdaq.com/'
    },
    {
        id: 'sp500',
        name: 'S&P 500',
        nameKo: 'S&P 500',
        description: 'S&P 500 Index tracking 500 large US companies',
        descriptionKo: '500개 대형 미국 기업을 추적하는 S&P 500 지수',
        source: 'Alpha Vantage',
        symbol: '^GSPC',
        unit: '',
        link: 'https://www.spglobal.com/spdj/'
    }
    */
];

// 추가 추천 지표 (나스닥 투자용)
const ADDITIONAL_INDICATORS = [
    // Alpha Vantage 지표들은 무료 API 제한으로 인해 일시 비활성화
    /*
    {
        id: 'nasdaq_100',
        name: 'Nasdaq 100 Index',
        nameKo: '나스닥 100 지수',
        description: 'Nasdaq 100 Index tracking 100 largest non-financial companies',
        descriptionKo: '100개 최대 비금융 기업을 추적하는 나스닥 100 지수',
        source: 'Alpha Vantage',
        symbol: 'NDX',
        unit: '',
        link: 'https://www.nasdaq.com/'
    },
    */
    // 일시적으로 비활성화 - 올바른 시리즈 ID 필요
    // {
    //     id: 'pe_ratio',
    //     name: 'S&P 500 PE Ratio',
    //     nameKo: 'S&P 500 PER',
    //     description: 'Price-to-Earnings ratio of S&P 500',
    //     descriptionKo: 'S&P 500의 주가수익비율',
    //     source: 'FRED',
    //     seriesId: 'SP500PE_RATIO', // 올바른 시리즈 ID로 변경 필요
    //     unit: '',
    //     link: 'https://fred.stlouisfed.org/series/SP500PE_RATIO'
    // },
    {
        id: 'm2_money',
        name: 'M2 Money Supply',
        nameKo: 'M2 통화량',
        description: 'M2 money supply showing liquidity in the economy',
        descriptionKo: '경제 내 유동성을 나타내는 M2 통화량',
        source: 'FRED',
        seriesId: 'M2SL',
        unit: 'Billion USD',
        link: 'https://fred.stlouisfed.org/series/M2SL'
    },
    {
        id: 'consumer_confidence',
        name: 'Consumer Confidence Index',
        nameKo: '소비자 신뢰지수',
        description: 'Consumer confidence showing economic sentiment',
        descriptionKo: '경제 심리를 나타내는 소비자 신뢰지수',
        source: 'FRED',
        seriesId: 'UMCSENT',
        unit: '',
        link: 'https://fred.stlouisfed.org/series/UMCSENT'
    }
    // 일시적으로 비활성화 - 올바른 시리즈 ID 필요
    // {
    //     id: 'manufacturing_pmi',
    //     name: 'Manufacturing PMI',
    //     nameKo: '제조업 PMI',
    //     description: 'Manufacturing Purchasing Managers Index',
    //     descriptionKo: '제조업 구매자 관리자 지수',
    //     source: 'FRED',
    //     seriesId: 'PMI', // 올바른 시리즈 ID로 변경 필요
    //     unit: '',
    //     link: 'https://fred.stlouisfed.org/series/PMI'
    // }
];

/**
 * 지표 ID로 지표 찾기
 * @param {string} id - 지표 ID
 * @returns {Object|null} 지표 객체 또는 null
 */
function getIndicatorById(id) {
    return ECONOMIC_INDICATORS.find(ind => ind.id === id) || null;
}

/**
 * 모든 지표 가져오기
 * @returns {Array} 지표 배열
 */
function getAllIndicators() {
    return ECONOMIC_INDICATORS;
}

/**
 * 추가 지표 가져오기
 * @returns {Array} 추가 지표 배열
 */
function getAdditionalIndicators() {
    return ADDITIONAL_INDICATORS;
}
