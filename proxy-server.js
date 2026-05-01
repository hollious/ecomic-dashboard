// 프록시 서버 - CORS 문제 해결용
const express = require('express');
const cors = require('cors');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const app = express();
const PORT = 3000;

// CORS 설정
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON 파싱
app.use(express.json());

// 프록시 요청 처리 함수
async function proxyRequest(req, res, targetUrl) {
    try {
        const url = new URL(targetUrl);

        // 요청 옵션 설정
        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname + url.search,
            method: req.method,
            headers: {
                ...req.headers,
                host: url.hostname
            }
        };

        // 요청 보내기
        const protocol = url.protocol === 'https:' ? https : http;
        const proxyReq = protocol.request(options, (proxyRes) => {
            // 응답 헤더 설정
            res.writeHead(proxyRes.statusCode, proxyRes.headers);

            // 응답 데이터 파이프
            proxyRes.pipe(res);
        });

        proxyReq.on('error', (error) => {
            console.error('프록시 요청 오류:', error);
            res.status(500).json({ error: '프록시 요청 실패', message: error.message });
        });

        // POST/PUT 요청의 경우 본문 전달
        if (req.method !== 'GET' && req.body) {
            proxyReq.write(JSON.stringify(req.body));
        }

        proxyReq.end();
    } catch (error) {
        console.error('프록시 처리 오류:', error);
        res.status(500).json({ error: '프록시 처리 실패', message: error.message });
    }
}

// 환율 API 프록시 - 미들웨어 사용
app.use('/api/exchange-rates', (req, res) => {
    const targetUrl = `https://api.exchangerate-api.com/v4${req.url}`;
    console.log('환율 API 프록시:', targetUrl);
    proxyRequest(req, res, targetUrl);
});

// FRED API 프록시 - 미들웨어 사용
app.use('/api/fred', (req, res) => {
    const targetUrl = `https://api.stlouisfed.org/fred${req.url}`;
    console.log('FRED API 프록시:', targetUrl);
    proxyRequest(req, res, targetUrl);
});

// Alpha Vantage API 프록시 - 미들웨어 사용
app.use('/api/alpha-vantage', (req, res) => {
    const targetUrl = `https://www.alphavantage.co${req.url}`;
    console.log('Alpha Vantage API 프록시:', targetUrl);

    // 요청 옵션 설정
    const url = new URL(targetUrl);
    const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: req.method,
        headers: {
            ...req.headers,
            host: url.hostname
        }
    };

    // 요청 보내기
    const protocol = url.protocol === 'https:' ? https : http;
    const proxyReq = protocol.request(options, (proxyRes) => {
        let data = '';

        proxyRes.on('data', (chunk) => {
            data += chunk;
        });

        proxyRes.on('end', () => {
            console.log('Alpha Vantage API 응답:', data.substring(0, 200)); // 응답 로깅
            try {
                const jsonData = JSON.parse(data);
                res.status(proxyRes.statusCode).json(jsonData);
            } catch (error) {
                console.error('Alpha Vantage JSON 파싱 실패:', error);
                res.status(proxyRes.statusCode).send(data);
            }
        });
    });

    proxyReq.on('error', (error) => {
        console.error('Alpha Vantage 프록시 요청 오류:', error);
        res.status(500).json({ error: '프록시 요청 실패', message: error.message });
    });

    proxyReq.end();
});

// Google Translation API 프록시
app.post('/api/translate', (req, res) => {
    const targetUrl = `https://translation.googleapis.com/language/translate/v2?key=${req.body.apiKey}`;
    console.log('Translation API 프록시:', targetUrl);

    const options = {
        hostname: 'translation.googleapis.com',
        port: 443,
        path: `/language/translate/v2?key=${req.body.apiKey}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const proxyReq = https.request(options, (proxyRes) => {
        let data = '';

        proxyRes.on('data', (chunk) => {
            data += chunk;
        });

        proxyRes.on('end', () => {
            try {
                const jsonData = JSON.parse(data);
                res.json(jsonData);
            } catch (error) {
                res.status(500).json({ error: 'JSON 파싱 실패' });
            }
        });
    });

    proxyReq.on('error', (error) => {
        console.error('Translation API 프록시 오류:', error);
        res.status(500).json({ error: '번역 API 요청 실패', message: error.message });
    });

    proxyReq.write(JSON.stringify({
        q: req.body.q,
        source: req.body.source,
        target: req.body.target
    }));

    proxyReq.end();
});

// 루트 경로 - 프록시 서버 정보
app.get('/', (req, res) => {
    res.json({
        message: '프록시 서버가 실행 중입니다.',
        endpoints: {
            health: '/health',
            exchangeRates: '/api/exchange-rates/*',
            fred: '/api/fred/*',
            alphaVantage: '/api/alpha-vantage/*',
            translate: '/api/translate'
        }
    });
});

// 헬스 체크
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: '프록시 서버가 정상 작동 중입니다.' });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`프록시 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`http://localhost:${PORT}`);
});