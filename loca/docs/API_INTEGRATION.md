# API Integration

## Base URL

프론트엔드 API 기본 주소는 환경변수로 관리합니다.

```txt
VITE_PUBLIC_API_BASE_URL=
```

로컬 개발에서는 `.env.local`을 사용할 수 있고, 배포나 백엔드 서버에서는 플랫폼 또는 OS 환경변수로 값을 주입합니다. 실제 키와 비밀값은 저장소에 커밋하지 않습니다.

## Current Data Flow

```txt
Page
-> Service Function
-> API Request
-> Mock Data fallback
```

현재는 백엔드 API가 완전히 연결되지 않은 기능에서 Mock Data를 사용합니다. 실제 API가 준비된 기능은 서비스 함수 내부에서 실제 요청을 우선 사용하고, 실패 시 Mock Data로 화면 확인이 가능하게 둡니다.

## External API

- Frontend: Kakao Map JavaScript SDK로 지도 표시와 마커 렌더링
- Backend: Kakao Map REST API로 Kakao Place ID 조회 예정

## Backend Storage

백엔드는 Spring Boot를 사용하며, 데이터 저장은 Supabase와 연동할 예정입니다.

## API Areas

- Place: 장소 목록, 상세, 등록, 수정, 삭제
- Tag: 태그 목록, 생성, 삭제
- Review: 방문 기록과 리뷰 저장
- User: 사용자 정보와 인증
- Collection: Public Place와 Private Place를 묶은 코스 관리

## Error Policy

- 사용자에게는 짧고 명확한 오류 메시지를 보여줍니다.
- 개발 중에는 Mock fallback으로 화면을 유지할 수 있습니다.
- 실제 서비스 단계에서는 실패 원인을 서버 응답 기준으로 분리합니다.
