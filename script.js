// 메인 스크립트 - 경제 대시보드 메인 로직

// ============================================
// 전역 변수 및 상태 관리
// ============================================

// 차트 인스턴스 저장
let exchangeRateChart = null;
let dollarIndexChart = null;
let krwIndexChart = null;
let sparklineCharts = {}; // 스파크라인 차트 인스턴스 저장

// 로딩 상태
let isLoading = false;

// 에러 상태
let hasError = false;

// 환율 기간 (일수)
let exchangeRatePeriod = 30;

// ============================================
// 초기화 함수
// ============================================

/**
 * 페이지 로드 시 초기화
 * - DOMContentLoaded 이벤트 리스너 등록
 * - API 키 확인
 * - 초기 데이터 로드
 */
function initializeDashboard() {
    console.log('대시보드 초기화 시작...');

    // API 키 확인
    checkApiKeys();

    // 이벤트 리스너 등록
    setupEventListeners();

    // 기본 기간 버튼 활성화
    const defaultPeriodBtn = document.querySelector('.period-btn[data-period="30"]');
    if (defaultPeriodBtn) {
        defaultPeriodBtn.classList.add('active');
    }

    // 데이터 로드
    loadAllData();
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', handleRefresh);
    }

    const clearCacheBtn = document.getElementById('clearCacheBtn');
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', handleClearCache);
    }

    // 기간 버튼 이벤트 리스너
    const periodButtons = document.querySelectorAll('.period-btn');
    periodButtons.forEach(btn => {
        if (btn.classList.contains('reset-zoom-btn')) {
            btn.addEventListener('click', handleResetZoom);
        } else {
            btn.addEventListener('click', handlePeriodChange);
        }
    });
}

/**
 * Zoom 리셋 이벤트 핸들러
 */
function handleResetZoom() {
    // 환율 차트 zoom 리셋
    if (exchangeRateChart) {
        exchangeRateChart.resetZoom();
    }

    // 원화 인덱스 차트 zoom 리셋
    if (krwIndexChart) {
        krwIndexChart.resetZoom();
    }
}

/**
 * 기간 변경 이벤트 핸들러
 * @param {Event} event - 클릭 이벤트
 */
function handlePeriodChange(event) {
    const period = parseInt(event.target.dataset.period);
    exchangeRatePeriod = period;

    // 활성 버튼 스타일 변경
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // 환율 차트 zoom 리셋
    if (exchangeRateChart) {
        exchangeRateChart.resetZoom();
    }

    // 원화 인덱스 차트 zoom 리셋
    if (krwIndexChart) {
        krwIndexChart.resetZoom();
    }

    // 환율 데이터 다시 로드
    loadExchangeRates();
}

// ============================================
// API 키 확인 및 경고 표시
// ============================================

/**
 * API 키가 설정되어 있는지 확인
 * - config.js의 API 키 값 확인
 * - API 키가 없으면 경고 메시지 표시
 * - API 키가 있으면 경고 숨기기
 */
function checkApiKeys() {
    const apiWarning = document.getElementById('apiWarning');
    const missingKeys = [];

    // 각 API 키 확인
    if (!CONFIG.FRED_API_KEY || CONFIG.FRED_API_KEY === 'YOUR_FRED_API_KEY_HERE') {
        missingKeys.push('FRED API');
    }
    if (!CONFIG.GOOGLE_TRANSLATE_API_KEY || CONFIG.GOOGLE_TRANSLATE_API_KEY === 'YOUR_GOOGLE_TRANSLATE_API_KEY_HERE') {
        missingKeys.push('Google Translation API');
    }
    if (!CONFIG.ALPHA_VANTAGE_API_KEY || CONFIG.ALPHA_VANTAGE_API_KEY === 'YOUR_ALPHA_VANTAGE_API_KEY_HERE') {
        missingKeys.push('Alpha Vantage API');
    }

    // API 키가 없으면 경고 표시
    if (missingKeys.length > 0) {
        apiWarning.style.display = 'block';
        console.warn('다음 API 키가 설정되지 않았습니다:', missingKeys.join(', '));
    } else {
        apiWarning.style.display = 'none';
        console.log('모든 API 키가 설정되었습니다.');
    }
}

// ============================================
// 데이터 로드 함수
// ============================================

/**
 * 모든 데이터 로드
 * - 환율 데이터
 * - 달러 인덱스 데이터
 * - 경제 지표 데이터
 * - 추가 지표 데이터
 * - 각 데이터 로드 후 UI 업데이트
 */
async function loadAllData() {
    if (isLoading) {
        console.log('이미 데이터를 로드 중입니다.');
        return;
    }

    isLoading = true;
    hasError = false;
    clearErrors();

    try {
        console.log('모든 데이터 로드 시작...');

        // 병렬로 데이터 로드
        await Promise.all([
            loadExchangeRates(),
            loadDollarIndex(),
            loadEconomicIndicators(),
            loadAdditionalIndicators()
        ]);

        console.log('모든 데이터 로드 완료');
    } catch (error) {
        console.error('데이터 로드 중 오류 발생:', error);
        showError('데이터를 불러오는 중 오류가 발생했습니다: ' + error.message);
        hasError = true;
    } finally {
        isLoading = false;
    }
}

/**
 * 환율 데이터 로드
 * - fetchExchangeRates 함수 호출
 * - 캐시 확인
 * - 데이터 로드 후 차트 생성
 */
async function loadExchangeRates() {
    try {
        console.log('환율 데이터 로드 중...');

        const cacheKey = `exchange_rates_${exchangeRatePeriod}`;
        const data = await fetchWithCache(cacheKey, () =>
            fetchExchangeRates('KRW', exchangeRatePeriod)
        );

        // 환율 차트 생성
        updateExchangeRateChart(data);

        console.log('환율 데이터 로드 완료');
    } catch (error) {
        console.error('환율 데이터 로드 실패:', error);
        showError('환율 데이터를 불러오는 중 오류가 발생했습니다: ' + error.message);
        throw error;
    }
}

/**
 * 달러 인덱스 데이터 로드
 * - fetchFREDData 함수 호출 (DXY 시리즈)
 * - 캐시 확인
 * - 데이터 로드 후 차트 생성
 */
async function loadDollarIndex() {
    try {
        console.log('달러 인덱스 데이터 로드 중...');

        const cacheKey = 'dollar_index';
        const data = await fetchWithCache(cacheKey, () =>
            fetchFREDData('DTWEXBGS', CONFIG.FRED_API_KEY)
        );

        // 달러 인덱스 차트 생성
        updateDollarIndexChart(data);

        // 원화 인덱스 차트 생성 (환율 데이터 필요)
        const exchangeData = await fetchWithCache('exchange_rates', () =>
            fetchExchangeRates('KRW', CONFIG.EXCHANGE_RATE_DAYS)
        );
        updateKRWIndexChart(exchangeData);

        console.log('달러 인덱스 데이터 로드 완료');
    } catch (error) {
        console.error('달러 인덱스 데이터 로드 실패:', error);
        showError('달러 인덱스 데이터를 불러오는 중 오류가 발생했습니다: ' + error.message);
        throw error;
    }
}

/**
 * 경제 지표 데이터 로드
 * - ECONOMIC_INDICATORS 배열 순회
 * - 각 지표별 데이터 로드 (FRED 또는 Alpha Vantage)
 * - 캐시 확인
 * - 데이터 로드 후 UI 업데이트
 */
async function loadEconomicIndicators() {
    try {
        console.log('경제 지표 데이터 로드 중...');

        const indicators = getAllIndicators();
        const indicatorData = [];

        for (const indicator of indicators) {
            try {
                let data;

                if (indicator.source === 'FRED') {
                    const cacheKey = `indicator_${indicator.id}`;
                    data = await fetchWithCache(cacheKey, () =>
                        fetchFREDData(indicator.seriesId, CONFIG.FRED_API_KEY)
                    );
                } else if (indicator.source === 'Alpha Vantage') {
                    const cacheKey = `indicator_${indicator.id}`;
                    data = await fetchWithCache(cacheKey, () =>
                        fetchStockData(indicator.symbol, CONFIG.ALPHA_VANTAGE_API_KEY)
                    );
                }

                indicatorData.push({
                    indicator,
                    data
                });
            } catch (error) {
                console.error(`지표 ${indicator.name} 로드 실패:`, error);
                indicatorData.push({
                    indicator,
                    data: null,
                    error: error.message
                });
            }

            // API 리밋 방지를 위해 1초 딜레이
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // 경제 지표 UI 업데이트
        updateEconomicIndicatorsUI(indicatorData);

        console.log('경제 지표 데이터 로드 완료');
    } catch (error) {
        console.error('경제 지표 데이터 로드 실패:', error);
        showError('경제 지표 데이터를 불러오는 중 오류가 발생했습니다: ' + error.message);
        throw error;
    }
}

/**
 * 추가 지표 데이터 로드
 * - ADDITIONAL_INDICATORS 배열 순회
 * - 각 지표별 데이터 로드
 * - 캐시 확인
 * - 데이터 로드 후 UI 업데이트
 */
async function loadAdditionalIndicators() {
    try {
        console.log('추가 지표 데이터 로드 중...');

        const indicators = getAdditionalIndicators();
        const indicatorData = [];

        for (const indicator of indicators) {
            try {
                let data;

                if (indicator.source === 'FRED') {
                    const cacheKey = `additional_indicator_${indicator.id}`;
                    data = await fetchWithCache(cacheKey, () =>
                        fetchFREDData(indicator.seriesId, CONFIG.FRED_API_KEY)
                    );
                } else if (indicator.source === 'Alpha Vantage') {
                    const cacheKey = `additional_indicator_${indicator.id}`;
                    data = await fetchWithCache(cacheKey, () =>
                        fetchStockData(indicator.symbol, CONFIG.ALPHA_VANTAGE_API_KEY)
                    );
                }

                indicatorData.push({
                    indicator,
                    data
                });
            } catch (error) {
                console.error(`추가 지표 ${indicator.name} 로드 실패:`, error);
                indicatorData.push({
                    indicator,
                    data: null,
                    error: error.message
                });
            }

            // API 리밋 방지를 위해 1초 딜레이
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // 추가 지표 UI 업데이트
        updateAdditionalIndicatorsUI(indicatorData);

        console.log('추가 지표 데이터 로드 완료');
    } catch (error) {
        console.error('추가 지표 데이터 로드 실패:', error);
        showError('추가 지표 데이터를 불러오는 중 오류가 발생했습니다: ' + error.message);
        throw error;
    }
}

// ============================================
// UI 업데이트 함수
// ============================================

/**
 * 환율 차트 업데이트
 * - createExchangeRateChart 함수 호출
 * - 기존 차트가 있으면 파괴 후 재생성
 */
function updateExchangeRateChart(data) {
    const canvasId = 'exchangeRateChart';

    // 기존 차트 파괴
    if (exchangeRateChart) {
        exchangeRateChart.destroy();
    }

    // 새 차트 생성 및 저장
    exchangeRateChart = createExchangeRateChart(canvasId, data);
}

/**
 * 달러 인덱스 차트 업데이트
 * - createDollarIndexChart 함수 호출
 * - 기존 차트가 있으면 파괴 후 재생성
 */
function updateDollarIndexChart(data) {
    const canvasId = 'dollarIndexChart';

    // 기존 차트 파괴
    if (dollarIndexChart) {
        dollarIndexChart.destroy();
    }

    // 새 차트 생성 및 저장
    dollarIndexChart = createDollarIndexChart(canvasId, data);
}

/**
 * 원화 인덱스 차트 업데이트
 * - createKRWIndexChart 함수 호출
 * - 기존 차트가 있으면 파괴 후 재생성
 */
function updateKRWIndexChart(data) {
    const canvasId = 'krwIndexChart';

    // 기존 차트 파괴
    if (krwIndexChart) {
        krwIndexChart.destroy();
    }

    // 새 차트 생성 및 저장
    krwIndexChart = createKRWIndexChart(canvasId, data);
}

/**
 * 경제 지표 UI 업데이트
 * - indicatorsContainer에 지표 카드 생성
 * - 각 지표별 데이터 표시
 * - 로딩 상태 제거
 */
function updateEconomicIndicatorsUI(indicatorData) {
    const container = document.getElementById('indicatorsContainer');
    if (!container) return;

    // 컨테이너 비우기
    container.innerHTML = '';

    // 지표 카드 생성
    indicatorData.forEach(({ indicator, data, error }) => {
        const card = createIndicatorCard(indicator, data, error);
        container.appendChild(card);
    });
}

/**
 * 추가 지표 UI 업데이트
 * - additionalIndicatorsContainer에 지표 카드 생성
 * - 각 지표별 데이터 표시
 * - 로딩 상태 제거
 */
function updateAdditionalIndicatorsUI(indicatorData) {
    const container = document.getElementById('additionalIndicatorsContainer');
    if (!container) return;

    // 컨테이너 비우기
    container.innerHTML = '';

    // 지표 카드 생성
    indicatorData.forEach(({ indicator, data, error }) => {
        const card = createIndicatorCard(indicator, data, error);
        container.appendChild(card);
    });
}

/**
 * 지표 카드 생성
 * - 지표 정보 표시 (이름, 설명, 현재 값, 단위)
 * - 스파크라인 그래프 생성
 * - 데이터 링크 추가
 */
function createIndicatorCard(indicator, data, error) {
    const card = document.createElement('div');
    card.className = 'indicator-card';

    // 에러가 있는 경우
    if (error) {
        card.innerHTML = `
            <h3>${indicator.nameKo}</h3>
            <p class="error">데이터를 불러오는 중 오류가 발생했습니다</p>
            <p class="error-detail">${error}</p>
        `;
        return card;
    }

    // 데이터가 없는 경우
    if (!data) {
        card.innerHTML = `
            <h3>${indicator.nameKo}</h3>
            <p class="error">데이터를 사용할 수 없습니다</p>
        `;
        return card;
    }

    // 현재 값 추출
    let currentValue = null;
    let historicalData = [];

    if (indicator.source === 'FRED' && data.observations) {
        // FRED 데이터 처리
        const validObservations = data.observations.filter(obs => obs.value !== '.');
        if (validObservations.length > 0) {
            currentValue = parseFloat(validObservations[validObservations.length - 1].value);
            historicalData = validObservations.slice(-30).map(obs => parseFloat(obs.value));
        }
    } else if (indicator.source === 'Alpha Vantage') {
        // Alpha Vantage 데이터 처리
        console.log('Alpha Vantage 데이터:', indicator.name, data); // 디버깅용

        // 데이터가 비어있거나 제한 메시지인 경우 처리
        if (!data || Object.keys(data).length === 0) {
            console.warn(`Alpha Vantage 데이터가 비어있습니다: ${indicator.name}`);
            card.innerHTML = `
                <h3>${indicator.nameKo}</h3>
                <p class="error">데이터를 사용할 수 없습니다</p>
                <p class="error-detail">API 응답이 비어있습니다</p>
            `;
            return card;
        }

        // API 제한 메시지 확인
        if (data.Information) {
            console.warn(`Alpha Vantage API 제한: ${indicator.name}`);
            card.innerHTML = `
                <h3>${indicator.nameKo}</h3>
                <p class="error">API 제한 초과</p>
                <p class="error-detail">무료 API 사용량 초과</p>
            `;
            return card;
        }

        if (data['Global Quote']) {
            // Global Quote 형식
            const globalQuote = data['Global Quote'];
            console.log('Global Quote 데이터:', globalQuote); // 디버깅용

            // 다양한 필드명 시도
            if (globalQuote['05. price']) {
                currentValue = parseFloat(globalQuote['05. price']);
            } else if (globalQuote['02. open']) {
                currentValue = parseFloat(globalQuote['02. open']);
            } else if (globalQuote['04. close']) {
                currentValue = parseFloat(globalQuote['04. close']);
            } else {
                console.error('Global Quote에서 가격 데이터를 찾을 수 없음:', globalQuote);
            }

            if (!isNaN(currentValue)) {
                historicalData = [currentValue];
            }
        } else if (data['Time Series (Daily)']) {
            // Time Series 형식
            const timeSeries = data['Time Series (Daily)'];
            const dates = Object.keys(timeSeries).sort();
            if (dates.length > 0) {
                const latestDate = dates[dates.length - 1];
                currentValue = parseFloat(timeSeries[latestDate]['4. close']);
                historicalData = dates.slice(-30).map(date =>
                    parseFloat(timeSeries[date]['4. close'])
                );
            }
        } else if (data['Meta Data'] && data['Time Series (5min)']) {
            // 실시간 데이터 형식
            const timeSeries = data['Time Series (5min)'];
            const times = Object.keys(timeSeries).sort();
            if (times.length > 0) {
                const latestTime = times[times.length - 1];
                currentValue = parseFloat(timeSeries[latestTime]['4. close']);
                historicalData = [currentValue];
            }
        } else {
            console.error('알 수 없는 Alpha Vantage 데이터 형식:', data);
            card.innerHTML = `
                <h3>${indicator.nameKo}</h3>
                <p class="error">데이터 형식 오류</p>
                <p class="error-detail">알 수 없는 데이터 형식</p>
            `;
            return card;
        }
    }

    // 값 포맷팅
    const formattedValue = currentValue !== null
        ? (indicator.unit === '%' ? currentValue.toFixed(2) + '%' : currentValue.toLocaleString())
        : 'N/A';

    // 카드 HTML 생성
    card.innerHTML = `
        <h3>${indicator.nameKo}</h3>
        <p class="description">${indicator.descriptionKo}</p>
        <div class="value-container">
            <span class="value">${formattedValue}</span>
            <span class="unit">${indicator.unit}</span>
        </div>
        <div class="sparkline-container">
            <canvas id="sparkline_${indicator.id}"></canvas>
        </div>
        <a href="${indicator.link}" target="_blank" class="data-link">데이터 출처</a>
    `;

    // 스파크라인 그래프 생성 (데이터가 있는 경우)
    if (historicalData.length > 1) {
        setTimeout(() => {
            const sparklineId = `sparkline_${indicator.id}`;

            // 기존 스파크라인 차트 파괴
            if (sparklineCharts[sparklineId]) {
                sparklineCharts[sparklineId].destroy();
            }

            const color = CONFIG.CHART_COLORS.USD; // 기본 색상
            sparklineCharts[sparklineId] = createSparkline(sparklineId, historicalData, color);
        }, 100);
    }

    return card;
}

// ============================================
// 이벤트 핸들러
// ============================================

/**
 * 새로고침 버튼 클릭 이벤트
 * - 캐시 삭제 (선택적)
 * - 모든 데이터 다시 로드
 * - 로딩 상태 표시
 */
function handleRefresh() {
    console.log('새로고침 버튼 클릭');

    // 캐시 삭제 (Alpha Vantage 빈 데이터 문제 해결)
    clearCache();

    // 데이터 다시 로드
    loadAllData();
}

/**
 * 캐시 비우기 버튼 핸들러
 */
function handleClearCache() {
    console.log('캐시 비우기 버튼 클릭');

    // 모든 캐시 삭제
    localStorage.clear();
    sessionStorage.clear();

    // 쿠키도 삭제
    document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    console.log('모든 캐시 삭제 완료');

    // 사용자에게 알림
    alert('모든 캐시가 삭제되었습니다. 페이지를 새로고침합니다.\n\n그래도 문제가 있으면 브라우저에서 Ctrl+Shift+R (Mac: Cmd+Shift+R)을 눌러 강제 새로고침하세요.');

    // 페이지 새로고침
    setTimeout(() => {
        location.reload();
    }, 100);
}

// ============================================
// 에러 처리 함수
// ============================================

/**
 * 에러 메시지 표시
 * - errorContainer에 에러 메시지 추가
 * - 에러 타입별로 다른 스타일 적용
 */
function showError(message) {
    const errorContainer = document.getElementById('errorContainer');
    if (errorContainer) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorContainer.appendChild(errorElement);
    }
}

/**
 * 에러 메시지 제거
 * - errorContainer 비우기
 */
function clearErrors() {
    const errorContainer = document.getElementById('errorContainer');
    if (errorContainer) {
        errorContainer.innerHTML = '';
    }
}

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 캐시 삭제
 * - localStorage의 모든 캐시 데이터 삭제
 * - 차트 인스턴스 초기화
 */
function clearCache() {
    console.log('캐시 삭제 중...');

    // localStorage의 모든 항목 삭제
    localStorage.clear();

    // 스파크라인 차트 인스턴스 초기화
    sparklineCharts = {};

    // 세션 스토리지도 삭제
    sessionStorage.clear();

    console.log('캐시 삭제 완료');
}

// ============================================
// 실행
// ============================================

// DOMContentLoaded 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    initializeDashboard();
});
