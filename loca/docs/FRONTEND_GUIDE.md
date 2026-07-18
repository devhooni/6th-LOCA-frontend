# Frontend Guide

## Naming

- Component: `PascalCase`
- Function / variable: `camelCase`
- Boolean: `is`, `has`, `can`, `should` 접두어 사용
- Event handler 내부 함수: `handleClick`, `handleSubmit`
- Event props: `onClick`, `onSubmit`
- Domain shape: `Place`, `Review`, `User`
- Request shape: `CreatePlaceRequest`
- Response shape: `PlaceResponse`

## Folder Rule

- `src/pages`: 화면 단위 컴포넌트
- `src/components/common`: 버튼, 카드, 칩 등 재사용 UI
- `src/components/layout`: AppShell, BottomNav 등 화면 골격
- `src/components/map`: Kakao Map 관련 UI
- `src/services`: API 요청과 Mock fallback
- `src/types`: 도메인 형태를 정리한 JS 모듈
- `src/mocks`: 백엔드 미연결 시 사용하는 데이터

현재는 Vite + React Router 구조입니다. 일부 Next 호환 import는 `vite.config.js` alias로 유지되고 있으므로, 새 코드에서는 React Router 기준으로 작성하고 기존 코드는 별도 정리 PR에서 교체합니다.

## Component Rule

- 화면 단위 컴포넌트는 `src/pages`에 둡니다.
- 재사용 컴포넌트는 `src/components`에 둡니다.
- 상태, 이벤트, 브라우저 API, 지도 SDK 사용 범위를 컴포넌트 내부에 명확히 둡니다.
- 한 컴포넌트가 지나치게 길어지면 반복 UI부터 분리합니다.

## Styling

- Tailwind CSS를 기본 스타일링 방식으로 사용합니다.
- 색상은 가능한 한 CSS 변수와 기존 토큰을 우선 사용합니다.
- 카드 안에 카드를 중첩하지 않습니다.
- 모바일 320px, 375px, 390px, 430px과 데스크톱 화면을 확인합니다.
- 버튼, 탭, 바텀시트, 입력폼은 hover/focus/disabled 상태를 함께 고려합니다.

## API Service

- 페이지에서 직접 `fetch`를 호출하지 않습니다.
- `src/services/*Service.js`에서 API 요청과 fallback을 관리합니다.
- 백엔드 미연결 또는 요청 실패 시 Mock Data를 사용할 수 있지만, 실제 API가 준비된 기능은 실제 데이터를 우선합니다.

## Import

- 외부 라이브러리
- React / Router 관련 import
- 내부 alias import
- 상대 경로 import

복잡한 자동 정렬 규칙은 아직 도입하지 않고, 리뷰 가능한 수준의 일관성만 유지합니다.
