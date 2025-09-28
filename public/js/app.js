// Socket.io 연결
const socket = io();

// DOM 요소들
const urlForm = document.getElementById('urlForm');
const youtubeUrlInput = document.getElementById('youtubeUrl');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const logsContainer = document.getElementById('logs');
const currentSessionSpan = document.getElementById('currentSession');
const sessionStatusSpan = document.getElementById('sessionStatus');
const activeSessionsSpan = document.getElementById('activeSessions');

// 현재 세션 ID
let currentSessionId = null;

// 로그 추가 함수
function addLog(message, type = 'info') {
    const logItem = document.createElement('div');
    logItem.className = `log-item ${type}`;
    
    const timestamp = new Date().toLocaleTimeString();
    logItem.innerHTML = `
        <span class="timestamp">[${timestamp}]</span>
        <span class="message">${message}</span>
    `;
    
    logsContainer.appendChild(logItem);
    logsContainer.scrollTop = logsContainer.scrollHeight;
}

// 상태 업데이트 함수
function updateStatus(sessionId, status) {
    currentSessionId = sessionId;
    currentSessionSpan.textContent = sessionId || '없음';
    sessionStatusSpan.textContent = status || '대기 중';
    
    // 버튼 상태 업데이트
    if (sessionId) {
        startBtn.disabled = true;
        stopBtn.disabled = false;
    } else {
        startBtn.disabled = false;
        stopBtn.disabled = true;
    }
}

// URL 폼 제출 처리
urlForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = youtubeUrlInput.value.trim();
    if (!url) {
        addLog('URL을 입력해주세요.', 'warning');
        return;
    }
    
    // YouTube URL 유효성 검사
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
        addLog('올바른 YouTube URL을 입력해주세요.', 'error');
        return;
    }
    
    try {
        addLog('자동화 작업을 시작합니다...', 'info');
        startBtn.disabled = true;
        
        const response = await fetch('/api/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url })
        });
        
        const data = await response.json();
        
        if (data.success) {
            updateStatus(data.sessionId, '실행 중');
            addLog(`작업이 시작되었습니다. (세션: ${data.sessionId})`, 'success');
            addLog(`대상 URL: ${url}`, 'info');
        } else {
            addLog(`오류: ${data.error}`, 'error');
            startBtn.disabled = false;
        }
        
    } catch (error) {
        addLog(`네트워크 오류: ${error.message}`, 'error');
        startBtn.disabled = false;
    }
});

// 중지 버튼 클릭 처리
stopBtn.addEventListener('click', async () => {
    if (!currentSessionId) return;
    
    try {
        addLog('작업을 중지합니다...', 'warning');
        
        const response = await fetch(`/api/stop/${currentSessionId}`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            updateStatus(null, '대기 중');
            addLog('작업이 중지되었습니다.', 'info');
        } else {
            addLog(`중지 오류: ${data.error}`, 'error');
        }
        
    } catch (error) {
        addLog(`중지 오류: ${error.message}`, 'error');
    }
});

// Socket.io 이벤트 리스너
socket.on('connect', () => {
    addLog('서버에 연결되었습니다.', 'success');
});

socket.on('disconnect', () => {
    addLog('서버 연결이 끊어졌습니다.', 'warning');
});

socket.on('log', (data) => {
    addLog(data.message, data.type || 'info');
});

socket.on('status', (data) => {
    if (data.sessionId === currentSessionId) {
        updateStatus(data.sessionId, data.status);
        addLog(`상태 변경: ${data.status}`, 'info');
    }
});

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    addLog('앱이 준비되었습니다. YouTube URL을 입력하세요.', 'info');
    
    // 활성 세션 수 업데이트 (주기적으로)
    setInterval(async () => {
        try {
            const response = await fetch('/api/status');
            if (response.ok) {
                const data = await response.json();
                activeSessionsSpan.textContent = data.activeSessions || 0;
            }
        } catch (error) {
            // 에러 무시 (선택적 기능)
        }
    }, 5000);
});
