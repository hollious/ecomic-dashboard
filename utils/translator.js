// 번역 함수

// api.js에서 정의된 함수들 사용
// 캐시 함수는 api.js에서 가져옴

/**
 * 텍스트 번역 (Google Cloud Translation API)
 * @param {string} text - 번역할 텍스트
 * @param {string} sourceLang - 원본 언어 (기본: 'en')
 * @param {string} targetLang - 목표 언어 (기본: 'ko')
 * @returns {Promise<string>} 번역된 텍스트
 */
async function translateText(text, sourceLang = 'en', targetLang = 'ko') {
    try {
        const response = await fetch('http://localhost:3000/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                apiKey: CONFIG.GOOGLE_TRANSLATE_API_KEY,
                q: [text],
                source: sourceLang,
                target: targetLang
            })
        });

        if (!response.ok) {
            throw new Error(`번역 API 오류: ${response.status}`);
        }

        const data = await response.json();
        const translatedText = data.data.translations[0].translatedText;

        return translatedText;
    } catch (error) {
        console.error('번역 실패:', error);
        // API 오류 시 원문 반환
        return text;
    }
}

/**
 * 경제 지표 번역 (사전 정의된 번역 사용)
 * @param {string} indicator - 지표 이름
 * @returns {Object} { 원문, 번역 }
 */
function translateIndicator(indicator) {
    const translations = {
        'GDP Growth Rate': 'GDP 성장률',
        'CPI Inflation Rate': 'CPI 인플레이션율',
        'Unemployment Rate': '실업률',
        'Federal Funds Rate': 'Fed 기준금리',
        '10-Year Treasury Yield': '10년물 국채 금리',
        'VIX Index': 'VIX 변동성 지수',
        'Nasdaq Composite': '나스닥 종합지수',
        'S&P 500': 'S&P 500',
        'Dollar Index': '달러 인덱스',
        'KRW Index': '원화 인덱스',
        'USD/KRW': '달러/원',
        'EUR/KRW': '유로/원',
        'GBP/KRW': '파운드/원',
        'JPY/KRW': '엔/원'
    };

    return {
        original: indicator,
        translated: translations[indicator] || indicator
    };
}

/**
 * 경제 지표 설명 번역
 * @param {string} description - 설명 텍스트
 * @returns {Promise<Object>} { 원문, 번역 }
 */
async function translateDescription(description) {
    const translated = await translateText(description);
    return {
        original: description,
        translated: translated
    };
}

/**
 * 번역된 HTML 요소 생성
 * @param {string} originalText - 원문
 * @param {string} translatedText - 번역문
 * @param {string} link - 원문 링크 (선택)
 * @returns {HTMLElement} HTML 요소
 */
function createTranslatedElement(originalText, translatedText, link = null) {
    const container = document.createElement('div');
    container.className = 'translated-content';

    const original = document.createElement('div');
    original.className = 'original-text';
    original.textContent = originalText;

    const translated = document.createElement('div');
    translated.className = 'translated-text';
    translated.textContent = translatedText;

    container.appendChild(original);
    container.appendChild(translated);

    if (link) {
        const linkElement = document.createElement('a');
        linkElement.href = link;
        linkElement.target = '_blank';
        linkElement.rel = 'noopener noreferrer';
        linkElement.className = 'source-link';
        linkElement.textContent = '원문 보기';
        container.appendChild(linkElement);
    }

    return container;
}
