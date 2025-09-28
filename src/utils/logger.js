const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../../logs');
        this.ensureLogDir();
    }

    // 로그 디렉토리 생성
    ensureLogDir() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    // 로그 파일명 생성 (날짜별)
    getLogFileName() {
        const date = new Date().toISOString().split('T')[0];
        return path.join(this.logDir, `youtube-automation-${date}.log`);
    }

    // 로그 포맷팅
    formatLog(level, message, sessionId = null) {
        const timestamp = new Date().toISOString();
        const sessionInfo = sessionId ? `[${sessionId}]` : '';
        return `${timestamp} ${sessionInfo} [${level.toUpperCase()}] ${message}`;
    }

    // 콘솔에 로그 출력
    log(level, message, sessionId = null) {
        const formattedLog = this.formatLog(level, message, sessionId);
        console.log(formattedLog);
    }

    // 파일에 로그 저장
    logToFile(level, message, sessionId = null) {
        try {
            const formattedLog = this.formatLog(level, message, sessionId);
            const logFile = this.getLogFileName();
            
            fs.appendFileSync(logFile, formattedLog + '\n', 'utf8');
        } catch (error) {
            console.error('로그 파일 저장 실패:', error);
        }
    }

    // 통합 로그 메서드
    write(level, message, sessionId = null) {
        this.log(level, message, sessionId);
        this.logToFile(level, message, sessionId);
    }

    // 레벨별 로그 메서드
    info(message, sessionId = null) {
        this.write('info', message, sessionId);
    }

    success(message, sessionId = null) {
        this.write('success', message, sessionId);
    }

    warning(message, sessionId = null) {
        this.write('warning', message, sessionId);
    }

    error(message, sessionId = null) {
        this.write('error', message, sessionId);
    }

    // 오래된 로그 파일 정리 (7일 이상)
    cleanupOldLogs() {
        try {
            const files = fs.readdirSync(this.logDir);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            files.forEach(file => {
                const filePath = path.join(this.logDir, file);
                const stats = fs.statSync(filePath);
                
                if (stats.mtime < sevenDaysAgo) {
                    fs.unlinkSync(filePath);
                    this.info(`오래된 로그 파일 삭제: ${file}`);
                }
            });
        } catch (error) {
            this.error(`로그 정리 중 오류: ${error.message}`);
        }
    }
}

module.exports = Logger;
