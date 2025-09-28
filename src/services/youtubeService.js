const puppeteer = require('puppeteer');

class YouTubeService {
    constructor() {
        this.browser = null;
        this.page = null;
        this.isRunning = false;
    }

    // 브라우저 인스턴스 생성
    async initBrowser() {
        try {
            this.browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ]
            });

            this.page = await this.browser.newPage();
            
            // User Agent 설정 (일반적인 브라우저로 위장)
            await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            
            // 뷰포트 설정
            await this.page.setViewport({ width: 1920, height: 1080 });
            
            return true;
        } catch (error) {
            console.error('브라우저 초기화 실패:', error);
            return false;
        }
    }

    // YouTube URL 유효성 검사
    isValidYouTubeUrl(url) {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
        return youtubeRegex.test(url);
    }

    // YouTube 페이지로 이동 및 영상 재생
    async playVideo(url, onLog) {
        if (!this.isValidYouTubeUrl(url)) {
            throw new Error('유효하지 않은 YouTube URL입니다.');
        }

        if (this.isRunning) {
            throw new Error('이미 실행 중인 작업이 있습니다.');
        }

        this.isRunning = true;

        try {
            onLog('브라우저를 초기화합니다...', 'info');
            
            if (!this.browser) {
                const initialized = await this.initBrowser();
                if (!initialized) {
                    throw new Error('브라우저 초기화에 실패했습니다.');
                }
            }

            onLog('YouTube 페이지로 이동합니다...', 'info');
            await this.page.goto(url, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });

            // 페이지 로딩 대기
            await this.page.waitForTimeout(3000);

            // 광고 및 팝업 처리
            await this.handleAdsAndPopups(onLog);

            // 재생 버튼 클릭
            onLog('영상 재생을 시작합니다...', 'info');
            await this.startPlayback(onLog);

            // 재생 상태 모니터링
            await this.monitorPlayback(onLog);

            onLog('영상 재생이 완료되었습니다.', 'success');

        } catch (error) {
            onLog(`오류 발생: ${error.message}`, 'error');
            throw error;
        } finally {
            this.isRunning = false;
        }
    }

    // 광고 및 팝업 처리
    async handleAdsAndPopups(onLog) {
        try {
            // 광고 건너뛰기 버튼 찾기
            const skipButton = await this.page.$('button[class*="skip"], .ytp-ad-skip-button, .ytp-ad-skip-button-modern');
            if (skipButton) {
                onLog('광고를 건너뜁니다...', 'info');
                await skipButton.click();
                await this.page.waitForTimeout(2000);
            }

            // 팝업 닫기
            const closeButton = await this.page.$('button[aria-label*="닫기"], button[aria-label*="Close"], .ytp-popup-close-button');
            if (closeButton) {
                onLog('팝업을 닫습니다...', 'info');
                await closeButton.click();
                await this.page.waitForTimeout(1000);
            }

        } catch (error) {
            onLog(`광고/팝업 처리 중 오류: ${error.message}`, 'warning');
        }
    }

    // 재생 시작
    async startPlayback(onLog) {
        try {
            // 재생 버튼 찾기 (여러 선택자 시도)
            const playSelectors = [
                'button[aria-label*="재생"]',
                'button[aria-label*="Play"]',
                '.ytp-play-button',
                '.ytp-large-play-button',
                'button[title*="재생"]',
                'button[title*="Play"]'
            ];

            let playButton = null;
            for (const selector of playSelectors) {
                playButton = await this.page.$(selector);
                if (playButton) break;
            }

            if (playButton) {
                await playButton.click();
                onLog('재생 버튼을 클릭했습니다.', 'success');
                await this.page.waitForTimeout(2000);
            } else {
                onLog('재생 버튼을 찾을 수 없습니다. 자동 재생을 기다립니다...', 'warning');
                await this.page.waitForTimeout(5000);
            }

        } catch (error) {
            onLog(`재생 시작 중 오류: ${error.message}`, 'warning');
        }
    }

    // 재생 상태 모니터링
    async monitorPlayback(onLog) {
        const maxWaitTime = 300000; // 5분
        const checkInterval = 5000; // 5초마다 체크
        let elapsedTime = 0;

        while (elapsedTime < maxWaitTime && this.isRunning) {
            try {
                // 재생 중인지 확인
                const isPlaying = await this.page.evaluate(() => {
                    const video = document.querySelector('video');
                    if (!video) return false;
                    return !video.paused && video.currentTime > 0;
                });

                if (isPlaying) {
                    onLog('영상이 재생 중입니다...', 'info');
                } else {
                    onLog('영상 재생이 일시정지되었습니다.', 'warning');
                }

                // 영상이 끝났는지 확인
                const isEnded = await this.page.evaluate(() => {
                    const video = document.querySelector('video');
                    if (!video) return false;
                    return video.ended;
                });

                if (isEnded) {
                    onLog('영상이 끝났습니다.', 'success');
                    break;
                }

                await this.page.waitForTimeout(checkInterval);
                elapsedTime += checkInterval;

            } catch (error) {
                onLog(`재생 모니터링 중 오류: ${error.message}`, 'warning');
                await this.page.waitForTimeout(checkInterval);
                elapsedTime += checkInterval;
            }
        }

        if (elapsedTime >= maxWaitTime) {
            onLog('최대 대기 시간을 초과했습니다.', 'warning');
        }
    }

    // 작업 중단
    async stop() {
        this.isRunning = false;
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
    }

    // 리소스 정리
    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
        this.isRunning = false;
    }
}

module.exports = YouTubeService;
