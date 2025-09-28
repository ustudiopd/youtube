const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 환경 변수 설정
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 템플릿 엔진 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 메모리 기반 세션 저장소
const sessions = new Map();

// 기본 라우트
app.get('/', (req, res) => {
    res.render('index', { 
        title: 'YouTube 자동화 앱',
        activeSessions: sessions.size 
    });
});

// API 라우트
app.post('/api/start', (req, res) => {
    const { url } = req.body;
    
    if (!url) {
        return res.status(400).json({ error: 'URL이 필요합니다.' });
    }

    // 세션 ID 생성
    const sessionId = Date.now().toString();
    
    // 세션 생성
    sessions.set(sessionId, {
        id: sessionId,
        url: url,
        status: 'running',
        startTime: new Date(),
        logs: []
    });

    // 로그 함수 생성
    const onLog = (message, type = 'info') => {
        const session = sessions.get(sessionId);
        if (session) {
            session.logs.push({ message, type, timestamp: new Date() });
            io.emit('log', { message, type, sessionId });
        }
        console.log(`[${sessionId}] [${type.toUpperCase()}] ${message}`);
    };

    // 시뮬레이션된 YouTube 자동화 (실제 자동화 대신)
    setImmediate(async () => {
        try {
            onLog('YouTube URL을 분석합니다...', 'info');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            onLog('영상 정보를 가져옵니다...', 'info');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            onLog('자동 재생을 시뮬레이션합니다...', 'info');
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            onLog('조회수를 모니터링합니다...', 'info');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const session = sessions.get(sessionId);
            if (session) {
                session.status = 'completed';
                session.endTime = new Date();
                onLog('시뮬레이션이 완료되었습니다. (실제 자동화는 Puppeteer가 필요합니다)', 'success');
            }
        } catch (error) {
            const session = sessions.get(sessionId);
            if (session) {
                session.status = 'failed';
                session.endTime = new Date();
                onLog(`시뮬레이션 실패: ${error.message}`, 'error');
            }
        }
    });

    res.json({ 
        success: true, 
        sessionId: sessionId,
        message: '시뮬레이션 작업이 시작되었습니다.' 
    });
});

app.get('/api/status/:id', (req, res) => {
    const sessionId = req.params.id;
    const session = sessions.get(sessionId);
    
    if (!session) {
        return res.status(404).json({ error: '세션을 찾을 수 없습니다.' });
    }
    
    res.json(session);
});

app.post('/api/stop/:id', (req, res) => {
    const sessionId = req.params.id;
    const session = sessions.get(sessionId);
    
    if (!session) {
        return res.status(404).json({ error: '세션을 찾을 수 없습니다.' });
    }
    
    session.status = 'stopped';
    session.endTime = new Date();
    sessions.delete(sessionId);
    
    console.log(`세션 중단: ${sessionId}`);
    
    res.json({ success: true, message: '작업이 중단되었습니다.' });
});

// Socket.io 연결 처리
io.on('connection', (socket) => {
    console.log('사용자가 연결되었습니다:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('사용자가 연결을 해제했습니다:', socket.id);
    });
});

// 서버 시작
server.listen(PORT, () => {
    console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`http://localhost:${PORT}에서 앱에 접속하세요.`);
    console.log('YouTube 자동화 앱 (시뮬레이션 모드)이 시작되었습니다.');
});

// 프로세스 종료 시 정리
process.on('SIGINT', () => {
    console.log('\n서버를 종료합니다...');
    console.log('서버가 정상적으로 종료되었습니다.');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n서버를 종료합니다...');
    console.log('서버가 정상적으로 종료되었습니다.');
    process.exit(0);
});

module.exports = { app, server, io, sessions };
