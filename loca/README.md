# LOCA Frontend

LOCA는 홍대 주변의 장소와 개인의 경험을 기록하고 공유하는 로컬 탐험 서비스입니다. 기존 지도에 있는 상업 장소뿐 아니라 사용자가 직접 남기는 Private Place까지 다루는 것을 목표로 합니다.

## Tech Stack

- Vite
- React
- React Router
- JavaScript / JSX
- Tailwind CSS
- Kakao Map JavaScript SDK
- Spring Boot REST API 연동 예정
- Supabase 기반 데이터 저장 예정

현재 앱은 Vite 기반 React 프로젝트이며, 라우팅은 React Router 기준으로 동작합니다.

## Run

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:5173`을 엽니다.

## Check

```bash
npm run lint
npm run build
```

## Environment Variables

로컬 개발에서는 `.env.local`을 사용할 수 있고, 배포 환경에서는 플랫폼 환경변수로 같은 값을 설정합니다. 실제 키는 저장소에 커밋하지 않습니다.

```bash
VITE_PUBLIC_KAKAO_MAP_KEY=
VITE_PUBLIC_API_BASE_URL=
```

## Folder Structure

```txt
src/main.jsx          앱 진입점
src/App.jsx           React Router 라우트 정의
src/pages/            화면 단위 컴포넌트
src/components/       공통 UI, 레이아웃, 지도 컴포넌트
src/services/         API 요청 및 Mock fallback 계층
src/types/            도메인 형태를 정리한 JS 모듈
src/mocks/            백엔드 미연결 시 사용하는 Mock Data
docs/                 프로젝트 규칙과 결정 기록
```

새 코드는 Vite와 React Router 기준으로 작성합니다.
