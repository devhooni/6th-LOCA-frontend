# LOCA Frontend Project - AI Context Document

## Overview
이 문서는 LOCA(SAVE YOUR STORY · SHARE YOUR SPOTS) 프론트엔드 프로젝트의 히스토리와 현재 상태를 기록하여, 앞으로 참여할 다른 AI 에이전트들이 프로젝트의 문맥을 빠르게 파악할 수 있도록 돕기 위해 작성되었습니다.

## History & Reset (2026-08-13)
- 기존에 작성되었던 누더기 API 연동(`fallback` 등) 및 프론트엔드 코드를 `.env`를 제외하고 모두 초기화(Scrap) 하였습니다.
- 새로운 와이어프레임과 컬러 팔레트를 바탕으로 바닥부터 새롭게 구축을 시작했습니다.

## Design System & Theme
- **CSS Framework**: Tailwind CSS v4
- **Color Palette** (적용 위치: `src/index.css` CSS Variables)
  - **Brand & Accent**: Primary (`#252525`), Soft (`#f4f4f5`), Second (`#6366f1`)
  - **Neutral**: Background (`#fafafa`), Surface (`#ffffff`), Border (`#e4e4e7`), Divider (`#f4f4f5`)
  - **Text**: Primary (`#18181b`), Secondary (`#71717a`), Muted (`#a1a1aa`)
- **Icons**: `lucide-react` 사용

## Current Implementation Status
### 1. Layout (`src/components/layout/`)
- **TopBar.jsx**: 상단 고정 헤더. 좌측에 `LOCA` 로고 및 `MapPin` 아이콘, 우측에 알림 아이콘 배치. (반투명 blur 효과 적용)
- **BottomBar.jsx**: 하단 고정 네비게이션 바. 5개의 메뉴(`explore`, `for you`, `+`, `search`, `my`) 배치. 중앙 `+` 버튼은 브랜드 컬러(`#6366f1`) 플로팅 스타일 적용.
- **AppShell.jsx**: `TopBar`와 `BottomBar`를 감싸고, 중앙 메인 콘텐츠 영역이 스크롤되도록 하는 모바일 웹 뷰 레이아웃 래퍼.

### 2. Core Features to be Implemented (기능 명세 기억용)
- **장소 관리**: Public / Private 장소 구분, 카카오 맵 API 기반 좌표 및 장소 정보 저장
- **리뷰/Visit**: 장소별 리뷰, 동행인(companion), 태그, 이미지 기록
- **태그 추천**: 키워드 및 분위기 태그 기반 탐색/추천 기능
- **인증**: JWT 기반 로그인/회원가입

## Notes for AI Agents
- **규칙 1**: 백엔드 API 호출 시, 에러가 날 경우 억지로 Mock 데이터를 띄워 성공한 척 덮어버리는(Fallback) 로직은 **절대 금지**입니다. 실서버 에러는 정직하게 프론트엔드로 전달되어야 합니다.
- **규칙 2**: 화면을 설계할 때 모바일 환경을 최우선으로 고려하며(Mobile-First), `AppShell` 레이아웃 내부의 `main` 태그 안에서 렌더링되도록 구성합니다.
