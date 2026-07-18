# Decisions

## 2026-07-18

### 논의 주제

Vite 전환 상태

### 선택지

- Vite + React Router 유지
- Next.js App Router로 복귀

### 최종 결정

현재 main 기준으로는 Vite + React Router를 유지합니다.

### 결정 이유

원격 main이 이미 Vite 구조로 마이그레이션되어 있고, 현재 화면들이 React Router 기반으로 동작합니다. 이번 주 목표는 신규 기능보다 안정화이므로 프레임워크를 다시 흔들지 않습니다.

### 영향 범위

전체 프론트엔드 구조, 라우팅, 레이아웃, 문서

### 추후 검토할 내용

Next 호환 import와 잔여 파일을 별도 PR에서 정리합니다.

## 2026-07-18

### 논의 주제

Bottom Navigation 최종 구조

### 선택지

- Home, Search, Add, Saved, My
- Home, Explore, Map, Collections, My

### 최종 결정

아직 확정하지 않습니다.

### 결정 이유

Saved와 Private Place의 관계, Collection의 우선순위가 아직 제품적으로 정리되어야 합니다.

### 영향 범위

하단 내비게이션, Home CTA, 주요 사용자 흐름

### 추후 검토할 내용

Figma Low-Fidelity Wireframe에서 2개 안을 비교합니다.

## 2026-07-18

### 논의 주제

Explore와 Map의 관계

### 선택지

- Explore는 리스트, Map은 위치 탐색으로 분리
- Explore 안에 Map을 통합

### 최종 결정

MVP에서는 분리합니다.

### 결정 이유

리스트 탐색과 지도 탐색은 사용자 목적이 다르며, 현재 구현도 별도 화면으로 구성되어 있습니다.

### 영향 범위

Explore, Map, Place Detail 이동 흐름

### 추후 검토할 내용

Figma에서 화면 간 중복 CTA를 정리합니다.

## 2026-07-18

### 논의 주제

Saved와 Private Place 차이

### 선택지

- Saved: 북마크한 장소
- Private Place: 사용자가 직접 등록한 장소

### 최종 결정

두 개념을 분리해서 설명합니다.

### 결정 이유

Saved는 행동 상태이고, Private Place는 장소의 출처와 공개 범위에 가까운 개념입니다.

### 영향 범위

My Page, Place Card, Map Bottom Sheet, Place New

### 추후 검토할 내용

공개/비공개 범위와 공유 정책을 백엔드와 함께 확정합니다.

## 2026-07-18

### 논의 주제

API 실패 시 Mock Fallback

### 선택지

- 실패 시 화면 에러 처리
- 개발 단계에서 Mock fallback 유지

### 최종 결정

개발 단계에서는 Mock fallback을 유지합니다.

### 결정 이유

백엔드 API가 완전히 준비되지 않은 상태에서도 화면 흐름을 검증할 수 있습니다.

### 영향 범위

서비스 함수, 화면 렌더링, 개발 테스트

### 추후 검토할 내용

실서비스 전 fallback 범위와 에러 정책을 재정의합니다.
