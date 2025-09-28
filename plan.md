# YouTube 자동화 웹 애플리케이션 개발 계획

## 1. 기능 개요

### 목표
Node.js, Express, Puppeteer를 사용하여 YouTube 영상의 자동 재생 및 조회수 증가를 위한 웹 애플리케이션을 개발합니다.

### 범위
- ✅ **구현할 내용**: 
  - YouTube URL 입력 및 자동 재생 기능
  - 실시간 진행 상황 모니터링
  - 다중 URL 순차 처리
  - 프록시 및 User Agent 설정
- ❌ **구현하지 않을 내용**:
  - YouTube API 공식 연동 (서비스 약관 위반 방지)
  - 대량 조회수 조작 (윤리적 고려)

## 2. 기술 설계

### 아키텍처
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Puppeteer     │
│   (EJS + JS)    │◄──►│   (Express)     │◄──►│   (Browser)     │
│                 │    │                 │    │                 │
│ - URL 입력      │    │ - API 엔드포인트 │    │ - 자동 재생     │
│ - 실시간 로그   │    │ - Socket.io      │    │ - 상태 모니터링 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 데이터 모델
```javascript
// 메모리 기반 세션 관리 (서버 재시작 시 초기화)
const Session = {
  id: String,
  url: String,
  status: 'pending' | 'running' | 'completed' | 'failed',
  startTime: Date,
  logs: Array<String>
}

// 환경 변수 기반 설정
const Config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MAX_CONCURRENT_SESSIONS: 3
}
```

### API 명세
- `POST /api/start` - 자동화 작업 시작
- `GET /api/status/:id` - 작업 상태 조회
- `POST /api/stop/:id` - 작업 중단
- `WebSocket /socket.io` - 실시간 로그 전송

## 3. 변경 파일 목록

### 생성할 파일
- `package.json` - 프로젝트 의존성 관리
- `index.js` - Express 서버 메인 파일
- `views/index.ejs` - 메인 UI 템플릿
- `public/js/app.js` - 프론트엔드 JavaScript
- `public/css/style.css` - 스타일시트
- `src/services/youtubeService.js` - YouTube 자동화 서비스
- `src/utils/logger.js` - 로깅 유틸리티
- `vercel.json` - Vercel 배포 설정
- `.env.example` - 환경 변수 예시

### 수정할 파일
- `README.md` - 프로젝트 문서 및 배포 가이드

## 4. 구현 단계 (Step-by-Step)

### Phase 1: 프로젝트 기초 환경 설정 (예상 소요: 1일)
- **1-1. Node.js 프로젝트 초기화**
  - `npm init`으로 package.json 생성
  - 기본 디렉토리 구조 설정
  - Git 저장소 초기화

- **1-2. 핵심 라이브러리 설치**
  ```bash
  npm install express puppeteer ejs socket.io
  npm install --save-dev nodemon
  ```

- **1-3. 기본 Express 서버 구축**
  - 환경 변수 기반 포트 설정
  - 정적 파일 서빙 설정
  - 기본 라우트 구성

- **1-4. 기본 UI 설계**
  - URL 입력 폼
  - 시작/중지 버튼
  - 실시간 로그 표시 영역

### Phase 2: YouTube 자동화 핵심 로직 구현 (예상 소요: 3일)
- **2-1. Puppeteer 브라우저 모듈**
  - 헤드리스 브라우저 설정
  - User Agent 랜덤화
  - 기본적인 에러 처리

- **2-2. YouTube 페이지 처리**
  - URL 유효성 검증
  - 페이지 로딩 대기
  - 광고 및 팝업 처리

- **2-3. 영상 재생 자동화**
  - 재생 버튼 클릭
  - 재생 상태 모니터링
  - 완료 감지 로직

- **2-4. 단일 URL 처리 (가벼운 구현)**
  - 하나의 URL씩 순차 처리
  - 기본적인 에러 복구

### Phase 3: 백엔드-프론트엔드 연동 (예상 소요: 2일)
- **3-1. API 엔드포인트 구현**
  - 간단한 REST API 설계
  - 기본 요청/응답 처리
  - 에러 핸들링

- **3-2. Socket.io 실시간 통신**
  - 서버-클라이언트 연결
  - 이벤트 기반 로그 전송
  - 연결 상태 관리

- **3-3. 프론트엔드 JavaScript**
  - Socket.io 클라이언트 설정
  - 실시간 UI 업데이트
  - 사용자 인터랙션 처리

### Phase 4: 배포 및 최종 테스트 (예상 소요: 1일)
- **4-1. Vercel 배포 설정**
  - `vercel.json` 설정 파일 생성
  - 환경 변수 설정
  - GitHub 연동

- **4-2. 기본 테스트**
  - 로컬 환경 테스트
  - 배포 환경 테스트
  - 기본 기능 검증

- **4-3. 문서화**
  - README.md 작성
  - 사용법 가이드
  - 배포 가이드

## 5. 배포 및 운영 계획

### GitHub 저장소 설정
- **저장소 생성**: `youtube-automation-app`
- **브랜치 전략**: `main` (배포), `develop` (개발)
- **이그노어 파일**: `.gitignore` 설정

### Vercel 배포 설정
- **자동 배포**: GitHub push 시 자동 배포
- **환경 변수**: Vercel 대시보드에서 설정
- **도메인**: Vercel 기본 도메인 또는 커스텀 도메인

### 기본 테스트 시나리오
- **로컬 테스트**
  1. `npm start`로 서버 실행
  2. 브라우저에서 `localhost:3000` 접속
  3. YouTube URL 입력 및 테스트

- **배포 테스트**
  1. GitHub에 코드 푸시
  2. Vercel 자동 배포 확인
  3. 배포된 URL에서 기능 테스트

## 6. 법적 고려사항 및 위험 요소

### ⚠️ 주의사항
- **YouTube 서비스 약관**: 자동화 도구 사용 시 계정 제재 가능
- **조회수 조작**: 플랫폼 정책 위반 및 법적 문제 가능성
- **대안 제안**: 교육/연구 목적으로만 사용, 상업적 활용 금지

### 🛡️ 위험 완화 방안
- Rate Limiting 구현 (요청 빈도 제한)
- 랜덤 지연 시간 추가
- 프록시 서버 활용으로 IP 분산
- 사용자 동의 및 면책 조항 추가

## 7. 성공 지표
- **기술적 성공**: 기본적인 자동화 실행 (성공률 > 80%)
- **사용자 경험**: 간단하고 직관적인 UI
- **배포 성공**: GitHub + Vercel 연동 완료
- **기본 기능**: URL 입력 → 자동 재생 → 완료 워크플로우
