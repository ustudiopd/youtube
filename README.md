# 🎬 YouTube 자동화 웹 애플리케이션

Node.js, Express, Puppeteer를 사용하여 YouTube 영상의 자동 재생을 위한 웹 애플리케이션입니다.

## ⚠️ 주의사항

이 애플리케이션은 **교육/연구 목적으로만** 사용하세요. YouTube 서비스 약관을 위반할 수 있으며, 상업적 활용은 금지됩니다.

## 🚀 기능

- YouTube URL 입력 및 자동 재생
- 실시간 진행 상황 모니터링
- Socket.io를 통한 실시간 로그 전송
- 반응형 웹 UI
- 메모리 기반 세션 관리

## 🛠️ 기술 스택

- **Backend**: Node.js, Express.js
- **Frontend**: EJS, HTML5, CSS3, JavaScript
- **Automation**: Puppeteer
- **Real-time**: Socket.io
- **Deployment**: Vercel

## 📦 설치 및 실행

### 로컬 개발 환경

1. **저장소 클론**
   ```bash
   git clone <repository-url>
   cd youtube-automation-app
   ```

2. **의존성 설치**
   ```bash
   npm install
   ```

3. **환경 변수 설정**
   ```bash
   cp env.example .env
   # .env 파일을 편집하여 필요한 설정을 추가하세요
   ```

4. **개발 서버 실행**
   ```bash
   npm run dev
   ```

5. **브라우저에서 접속**
   ```
   http://localhost:3000
   ```

### Vercel 배포

1. **GitHub에 코드 푸시**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Vercel 연동**
   - [Vercel](https://vercel.com)에 로그인
   - GitHub 저장소 연결
   - 자동 배포 설정

3. **환경 변수 설정**
   - Vercel 대시보드에서 환경 변수 설정
   - `NODE_ENV=production` 설정

## 📁 프로젝트 구조

```
youtube-automation-app/
├── index.js                 # Express 서버 메인 파일
├── package.json            # 프로젝트 의존성
├── vercel.json             # Vercel 배포 설정
├── views/
│   └── index.ejs           # 메인 UI 템플릿
├── public/
│   ├── css/
│   │   └── style.css       # 스타일시트
│   └── js/
│       └── app.js           # 프론트엔드 JavaScript
├── src/
│   ├── services/
│   │   └── youtubeService.js # YouTube 자동화 서비스
│   └── utils/
│       └── logger.js        # 로깅 유틸리티
└── logs/                   # 로그 파일 (자동 생성)
```

## 🔧 API 엔드포인트

### POST /api/start
YouTube 자동화 작업을 시작합니다.

**Request Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=..."
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "1234567890",
  "message": "자동화 작업이 시작되었습니다."
}
```

### GET /api/status/:id
특정 세션의 상태를 조회합니다.

**Response:**
```json
{
  "id": "1234567890",
  "url": "https://www.youtube.com/watch?v=...",
  "status": "running",
  "startTime": "2024-01-01T00:00:00.000Z",
  "logs": [...]
}
```

### POST /api/stop/:id
특정 세션을 중단합니다.

**Response:**
```json
{
  "success": true,
  "message": "작업이 중단되었습니다."
}
```

## 🔌 Socket.io 이벤트

### 클라이언트 → 서버
- `connect` - 서버 연결
- `disconnect` - 서버 연결 해제

### 서버 → 클라이언트
- `log` - 실시간 로그 메시지
- `status` - 세션 상태 변경

## 📝 사용법

1. **YouTube URL 입력**
   - 유효한 YouTube URL을 입력 필드에 입력
   - `https://www.youtube.com/watch?v=...` 형식

2. **자동화 시작**
   - "🚀 시작" 버튼 클릭
   - 실시간 로그에서 진행 상황 확인

3. **작업 중단**
   - "⏹️ 중지" 버튼으로 언제든 중단 가능

## 🐛 문제 해결

### 일반적인 문제

1. **브라우저 초기화 실패**
   - Puppeteer 의존성 재설치: `npm install puppeteer`
   - 시스템 권한 확인

2. **YouTube 페이지 로딩 실패**
   - 네트워크 연결 확인
   - URL 형식 검증

3. **실시간 로그가 표시되지 않음**
   - Socket.io 연결 상태 확인
   - 브라우저 콘솔에서 에러 메시지 확인

## 📄 라이선스

이 프로젝트는 교육/연구 목적으로만 사용하세요. 상업적 활용은 금지됩니다.

## 🤝 기여

버그 리포트나 기능 제안은 GitHub Issues를 통해 제출해주세요.

---

**⚠️ 면책 조항**: 이 도구의 사용으로 인한 모든 책임은 사용자에게 있습니다. YouTube 서비스 약관을 준수하여 사용하세요.
