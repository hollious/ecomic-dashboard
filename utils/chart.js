// 그래프 생성 함수

/**
 * 주말 제외 함수 (토요일=6, 일요일=0)
 * @param {string} dateString - 날짜 문자열 (YYYY-MM-DD)
 * @returns {boolean} 주말이면 true, 평일이면 false
 */
function isWeekend(dateString) {
    const date = new Date(dateString);
    const day = date.getDay();
    return day === 0 || day === 6; // 일요일(0) 또는 토요일(6)
}

/**
 * 환율 그래프 생성 (이중 축)
 * @param {string} canvasId - 캔버스 ID
 * @param {Object} data - 환율 데이터
 */
function createExchangeRateChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    console.log('환율 차트 데이터:', data); // 디버깅용
    console.log('환율 데이터 키:', Object.keys(data)); // 데이터 키 확인

    // Exchange Rate API 응답 형식 확인
    let rates = {};
    let dates = [];

    if (data.rates && typeof data.rates === 'object') {
        rates = data.rates;

        // rates의 키가 날짜 형식인지 확인
        const dateKeys = Object.keys(rates).filter(key => key.match(/^\d{4}-\d{2}-\d{2}$/));

        if (dateKeys.length > 0) {
            // 다중 날짜 데이터: { "2024-01-01": { USD: 1300, EUR: 1400, ... }, ... }
            dates = dateKeys.sort();
        } else {
            // 단일 날짜 데이터: { USD: 0.00075, EUR: 0.00069, ... }
            dates = [data.date || '현재'];
        }
    } else {
        console.error('환율 데이터 형식 오류:', data);
        console.error('데이터 키:', Object.keys(data));
        return null;
    }

    console.log('환율 차트 날짜 데이터:', dates); // 디버깅용
    console.log('환율 차트 rates 데이터:', rates); // 디버깅용

    // 데이터가 너무 적으면 경고
    if (dates.length === 0) {
        console.warn('환율 데이터가 없습니다.');
        return null;
    }

    // Exchange Rate API 형식인 경우 (rates가 통화별 환율인 경우)
    let usdRates, eurRates, gbpRates, jpyRates;

    if (dates.length === 1 && !rates[dates[0]]) {
        // Exchange Rate API 형식: { USD: 0.00075, EUR: 0.00069, ... }
        usdRates = [rates.USD];
        eurRates = [rates.EUR];
        gbpRates = [rates.GBP];
        jpyRates = [rates.JPY];
    } else {
        // 다중 날짜 데이터: { "2024-01-01": { USD: 1300, EUR: 1400, ... }, ... }
        // 주말 제외
        const weekdayDates = dates.filter(date => !isWeekend(date));
        usdRates = weekdayDates.map(date => rates[date].USD);
        eurRates = weekdayDates.map(date => rates[date].EUR);
        gbpRates = weekdayDates.map(date => rates[date].GBP);
        jpyRates = weekdayDates.map(date => rates[date].JPY);
        dates = weekdayDates; // 주말 제외된 날짜로 업데이트
    }

    console.log('환율 차트 데이터 처리 완료:', { dates, usdRates, eurRates, gbpRates, jpyRates });

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'USD/KRW',
                    data: usdRates,
                    borderColor: CONFIG.CHART_COLORS.USD,
                    backgroundColor: CONFIG.CHART_COLORS.USD + '20',
                    yAxisID: 'y',
                    tension: 0.1
                },
                {
                    label: 'EUR/KRW',
                    data: eurRates,
                    borderColor: CONFIG.CHART_COLORS.EUR,
                    backgroundColor: CONFIG.CHART_COLORS.EUR + '20',
                    yAxisID: 'y',
                    tension: 0.1
                },
                {
                    label: 'GBP/KRW',
                    data: gbpRates,
                    borderColor: CONFIG.CHART_COLORS.GBP,
                    backgroundColor: CONFIG.CHART_COLORS.GBP + '20',
                    yAxisID: 'y',
                    tension: 0.1
                },
                {
                    label: 'JPY(100엔)/KRW',
                    data: jpyRates,
                    borderColor: CONFIG.CHART_COLORS.JPY,
                    backgroundColor: CONFIG.CHART_COLORS.JPY + '20',
                    yAxisID: 'y',
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                title: {
                    display: true,
                    text: '주요 통화 대비 원화 환율'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
                        }
                    }
                },
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                            speed: 0.1
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x',
                    },
                    pan: {
                        enabled: true,
                        mode: 'x',
                    },
                    limits: {
                        x: {min: 'original', max: 'original'}
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '날짜'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: '원화 (KRW)'
                    }
                }
            }
        }
    });

    return chart;
}

/**
 * 달러 인덱스 그래프 생성
 * @param {string} canvasId - 캔버스 ID
 * @param {Object} data - FRED 데이터
 */
function createDollarIndexChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    // 날짜와 값 추출
    const observations = data.observations
        .filter(obs => obs.value !== '.')
        .slice(-90); // 최근 90일

    const dates = observations.map(obs => obs.date);
    const values = observations.map(obs => parseFloat(obs.value));

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: '달러 인덱스 (DXY)',
                data: values,
                borderColor: CONFIG.CHART_COLORS.DXY,
                backgroundColor: CONFIG.CHART_COLORS.DXY + '20',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '달러 인덱스 (DXY)'
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: '인덱스'
                    }
                }
            }
        }
    });

    return chart;
}

/**
 * 원화 인덱스 그래프 생성
 * @param {string} canvasId - 캔버스 ID
 * @param {Object} data - 환율 데이터
 */
function createKRWIndexChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    console.log('원화 인덱스 차트 데이터:', data); // 디버깅용

    // 날짜와 환율 데이터 추출
    let dates = [];
    let usdRates = [];

    if (data.rates && typeof data.rates === 'object') {
        const rates = data.rates;

        // rates의 키가 날짜 형식인지 확인
        const dateKeys = Object.keys(rates).filter(key => key.match(/^\d{4}-\d{2}-\d{2}$/));

        if (dateKeys.length > 0) {
            // 다중 날짜 데이터: { "2024-01-01": { USD: 1300, EUR: 1400, ... }, ... }
            dates = dateKeys.sort();
            // 주말 제외
            dates = dates.filter(date => !isWeekend(date));
            usdRates = dates.map(date => rates[date].USD);
        } else {
            // 단일 날짜 데이터: { USD: 0.00075, EUR: 0.00069, ... }
            dates = [data.date || '현재'];
            usdRates = [rates.USD];
        }
    } else {
        console.error('원화 인덱스 데이터 형식 오류:', data);
        return null;
    }

    // 데이터가 없으면 경고
    if (dates.length === 0 || usdRates.length === 0) {
        console.warn('원화 인덱스 데이터가 없습니다.');
        return null;
    }

    console.log('원화 인덱스 차트 데이터 처리 완료:', { dates, usdRates }); // 디버깅용

    // 원화 인덱스 계산 (USD/KRW의 역수)
    const krwIndex = usdRates.map(rate => 1000 / rate);

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: '원화 인덱스',
                data: krwIndex,
                borderColor: CONFIG.CHART_COLORS.KRW_INDEX,
                backgroundColor: CONFIG.CHART_COLORS.KRW_INDEX + '20',
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: '원화 인덱스 (USD/KRW 역수)'
                },
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                            speed: 0.1
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x',
                    },
                    pan: {
                        enabled: true,
                        mode: 'x',
                    },
                    limits: {
                        x: {min: 'original', max: 'original'}
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '날짜'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: '인덱스'
                    }
                }
            }
        }
    });

    return chart;
}

/**
 * 스파크라인 그래프 생성 (소형 그래프)
 * @param {string} canvasId - 캔버스 ID
 * @param {Array} data - 데이터 배열
 * @param {string} color - 색상
 */
function createSparkline(canvasId, data, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map((_, i) => i),
            datasets: [{
                data: data,
                borderColor: color,
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            }
        }
    });

    return chart;
}
