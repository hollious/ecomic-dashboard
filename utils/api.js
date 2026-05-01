// API 호출 함수

// 프록시 서버 URL
const PROXY_BASE_URL = 'http://localhost:3000';

/**
 * 환율 데이터 가져오기 (FRED API 사용)
 * @param {string} base - 기준 통화 (예: 'KRW')
 * @param {number} days - 가져올 일수
 * @returns {Promise<Object>} 환율 데이터
 */
async function fetchExchangeRates(base = 'KRW', days = 30) {
    try {
        // FRED API에서 환율 데이터 가져오기 (DEXKOUS: USD/KRW)
        const response = await fetch(
            `${PROXY_BASE_URL}/api/fred/series/observations?series_id=DEXKOUS&api_key=${CONFIG.FRED_API_KEY}&file_type=json&limit=${days}&sort_order=desc`
        );

        if (!response.ok) {
            throw new Error(`환율 API 오류: ${response.status}`);
        }

        const data = await response.json();
        console.log('FRED 환율 API 응답:', data); // 디버깅용
        console.log('관측치 개수:', data.observations ? data.observations.length : 0); // 디버깅용

        // FRED 데이터를 기존 형식으로 변환
        const rates = {};
        if (data.observations && data.observations.length > 0) {
            // 내림차순으로 정렬된 데이터를 오름차순으로 변환
            const sortedObservations = data.observations.reverse();

            sortedObservations.forEach(obs => {
                if (obs.value !== '.' && obs.value !== null && obs.value !== undefined) {
                    const usdKrw = parseFloat(obs.value);
                    rates[obs.date] = {
                        USD: usdKrw,
                        // 다른 통화 환율은 USD/KRW를 기준으로 계산
                        // EUR/USD ≈ 1.08, GBP/USD ≈ 1.27, USD/JPY ≈ 151
                        EUR: usdKrw * 1.08,  // EUR/KRW = USD/KRW * EUR/USD
                        GBP: usdKrw * 1.27,  // GBP/KRW = USD/KRW * GBP/USD
                        JPY: (usdKrw / 151) * 100  // 100엔당 원화 (스케일 조정)
                    };
                }
            });
        }

        console.log('변환된 환율 데이터:', rates); // 디버깅용
        console.log('변환된 데이터 개수:', Object.keys(rates).length); // 디버깅용
        console.log('최신 데이터 날짜:', data.observations && data.observations.length > 0 ? data.observations[0].date : 'N/A'); // 디버깅용

        return {
            rates: rates,
            date: data.observations && data.observations.length > 0 ? data.observations[0].date : new Date().toISOString().split('T')[0]
        };
    } catch (error) {
        console.error('환율 데이터 가져오기 실패:', error);
        throw error;
    }
}

/**
 * FRED API에서 시계열 데이터 가져오기
 * @param {string} seriesId - FRED 시리즈 ID
 * @param {string} apiKey - FRED API 키
 * @returns {Promise<Object>} FRED 데이터
 */
async function fetchFREDData(seriesId, apiKey) {
    try {
        const response = await fetch(
            `${PROXY_BASE_URL}/api/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json`
        );

        if (!response.ok) {
            throw new Error(`FRED API 오류: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('FRED 데이터 가져오기 실패:', error);
        throw error;
    }
}

/**
 * Alpha Vantage API에서 주가 데이터 가져오기
 * @param {string} symbol - 주식 심볼
 * @param {string} apiKey - Alpha Vantage API 키
 * @returns {Promise<Object>} 주가 데이터
 */
async function fetchStockData(symbol, apiKey) {
    try {
        const response = await fetch(
            `${PROXY_BASE_URL}/api/alpha-vantage/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
        );

        if (!response.ok) {
            throw new Error(`Alpha Vantage API 오류: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('주가 데이터 가져오기 실패:', error);
        throw error;
    }
}

/**
 * VIX 데이터 가져오기
 * @param {string} apiKey - Alpha Vantage API 키
 * @returns {Promise<Object>} VIX 데이터
 */
async function fetchVIXData(apiKey) {
    return fetchStockData('VIX', apiKey);
}

/**
 * 나스닥 지수 가져오기
 * @param {string} apiKey - Alpha Vantage API 키
 * @returns {Promise<Object>} 나스닥 데이터
 */
async function fetchNasdaqData(apiKey) {
    return fetchStockData('^IXIC', apiKey);
}

/**
 * S&P 500 지수 가져오기
 * @param {string} apiKey - Alpha Vantage API 키
 * @returns {Promise<Object>} S&P 500 데이터
 */
async function fetchSP500Data(apiKey) {
    return fetchStockData('^GSPC', apiKey);
}

/**
 * 캐시된 데이터 가져오기
 * @param {string} key - 캐시 키
 * @returns {Object|null} 캐시된 데이터 또는 null
 */
function getCachedData(key) {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();

    if (now - timestamp > CONFIG.CACHE_DURATION) {
        localStorage.removeItem(key);
        return null;
    }

    return data;
}

/**
 * 데이터 캐시하기
 * @param {string} key - 캐시 키
 * @param {Object} data - 캐시할 데이터
 */
function setCachedData(key, data) {
    const cacheData = {
        data,
        timestamp: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(cacheData));
}

/**
 * 모든 캐시 비우기
 */
function clearAllCache() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('indicator_') || key.startsWith('additional_indicator_') || key.startsWith('exchange_rate_') || key.startsWith('dollar_index_')) {
            localStorage.removeItem(key);
        }
    });
    console.log('모든 캐시가 비워졌습니다.');
}

/**
 * 캐시를 고려한 데이터 가져오기
 * @param {string} cacheKey - 캐시 키
 * @param {Function} fetchFn - 데이터 가져오기 함수
 * @returns {Promise<Object>} 데이터
 */
async function fetchWithCache(cacheKey, fetchFn) {
    const cached = getCachedData(cacheKey);
    if (cached) {
        console.log(`캐시된 데이터 사용: ${cacheKey}`);
        return cached;
    }

    const data = await fetchFn();
    setCachedData(cacheKey, data);
    return data;
}

// 함수 내보내기
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchExchangeRates,
        fetchDollarIndex,
        fetchFREDData,
        fetchStockData,
        fetchWithCache,
        clearAllCache,
        getCachedData,
        setCachedData
    };
}
