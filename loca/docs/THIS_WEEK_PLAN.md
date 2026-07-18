# This Week Plan

이번 주 목표는 신규 기능 개발이 아니라 프로젝트 초기 설정, 작업 규칙, 와이어프레임, 문서화 기준을 정리하는 것입니다.

## 1. 프로젝트 초기 설정 진단

- 현재 main은 Vite + React Router 구조입니다.
- 실행과 빌드는 가능하며 `npm run lint`, `npm run build`가 통과합니다.
- ESLint는 적용되어 있고, Prettier는 아직 없습니다.
- `.env.local`은 사용 중이고, 공유용 `.env.example`을 추가했습니다.
- README는 LOCA와 현재 Vite 구조 기준으로 정리했습니다.
- 라우팅은 React Router 기준으로 정리했습니다.

## 2. Git 브랜치 전략 초안

- `main`: 안정 버전
- `develop`: 통합 테스트
- `feature/<name>`: 신규 기능
- `fix/<name>`: 오류 수정
- `design/<name>`: UI / Figma 반영
- `chore/<name>`: 문서, 설정, 기타 작업

팀 규모상 처음에는 `main`, `develop`, `feature/*`, `fix/*`, `design/*`, `chore/*`만 사용해도 충분합니다.

## 3. 커밋 메시지 컨벤션 초안

형식:

```txt
type(scope): 변경 내용
```

예시:

- `feat(map): 장소 마커 선택 바텀시트 추가`
- `fix(layout): 모바일 하단 내비게이션 겹침 수정`
- `design(home): 주요 CTA 우선순위 재배치`
- `docs(readme): 프로젝트 실행 방법 추가`

## 4. PR 및 Issue 템플릿 초안

추가한 파일:

- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/ISSUE_TEMPLATE/feature.md`
- `.github/ISSUE_TEMPLATE/bug.md`
- `.github/ISSUE_TEMPLATE/refactor.md`

처음에는 Feature와 Bug 중심으로 사용하고, 구조 개선 작업이 늘어나면 Refactor 템플릿을 함께 사용합니다.

## 5. 코드 컨벤션 초안

- Component: `PascalCase`
- Function / variable: `camelCase`
- Boolean: `is`, `has`, `can`, `should`
- Event handler: `handleSubmit`, `handleClick`
- Event props: `onSubmit`, `onClick`
- API 요청은 페이지가 아니라 `src/services`에서 관리
- Mock Data는 `src/mocks`에 유지

## 6. 문서 구조 제안

추가한 문서:

- `docs/PROJECT_OVERVIEW.md`
- `docs/USER_FLOW.md`
- `docs/FRONTEND_GUIDE.md`
- `docs/GIT_CONVENTION.md`
- `docs/API_INTEGRATION.md`
- `docs/DECISIONS.md`
- `docs/PROJECT_SETUP_AUDIT.md`
- `docs/THIS_WEEK_PLAN.md`

## 7. 현재 필요한 Figma Wireframe 목록

- Home
- Explore
- For You
- Map + Bottom Sheet
- Place Detail
- Review Write
- My Page
- Place New
- Collections
- Admin Places / Tags

각 화면에는 화면 목적, 핵심 CTA, 진입 경로, CTA 클릭 후 이동, Loading, Empty, Error, Disabled 상태를 Annotation으로 남깁니다.

## 8. 팀이 직접 결정해야 할 항목

- Vite + React Router 구조 유지 여부
- Bottom Navigation 최종 메뉴
- Saved와 Private Place의 최종 구분
- 기록 공개 범위
- For You 추천 기준
- Public / Private Place 공유 정책
- Figma 최종 디자인 방향
- 백엔드 API 명세 변경

## 9. Codex가 바로 처리 가능한 항목

- 저장소 구조 분석
- 중복 Route와 컴포넌트 목록 정리
- Git / 코드 컨벤션 문서화
- PR / Issue 템플릿 작성
- README와 개발 문서 작성
- build, lint 확인
- Figma Low-Fidelity Wireframe 초안 작성
- 승인된 범위의 코드 정리

## 10. 이번 주 PR 단위 계획

### PR 1. docs/project-guides

- 목적: 프로젝트 운영 기준 문서화
- 예상 수정 파일: `README.md`, `docs/*`
- 작업 내용: 프로젝트 개요, 사용자 흐름, 프론트엔드 가이드, API 연동 정책, 결정 기록 작성
- 선행 결정: 문서 구조 동의
- 완료 조건: 문서가 짧고 명확하게 정리됨
- 테스트 방법: 문서 링크와 오탈자 확인
- 위험도: 낮음

### PR 2. chore/github-templates

- 목적: 협업을 위한 PR / Issue 양식 추가
- 예상 수정 파일: `.github/PULL_REQUEST_TEMPLATE.md`, `.github/ISSUE_TEMPLATE/*`
- 작업 내용: PR, Feature, Bug, Refactor 템플릿 작성
- 선행 결정: Issue 종류를 2개로 시작할지 3개로 시작할지 결정
- 완료 조건: GitHub에서 템플릿이 정상 표시됨
- 테스트 방법: GitHub Issue / PR 생성 화면 확인
- 위험도: 낮음

### PR 3. design/lofi-wireframe

- 목적: 기능 추가 전 화면 흐름 확정
- 예상 수정 파일: Figma Wireframe, `docs/USER_FLOW.md`
- 작업 내용: 주요 화면 Low-Fidelity Wireframe과 Annotation 작성
- 선행 결정: Bottom Navigation 후보 선택
- 완료 조건: 주요 CTA와 화면 이동이 설명 가능함
- 테스트 방법: 팀원이 사용자 흐름을 말로 따라갈 수 있는지 확인
- 위험도: 낮음

### PR 4. refactor/router-cleanup

- 목적: React Router 기준 라우팅 구조 안정화
- 예상 수정 파일: `src/pages/*`, `src/components/*`, `vite.config.js`
- 작업 내용: 화면 이동, URL 파라미터, 쿼리 파라미터 사용 방식 점검
- 선행 결정: Vite 구조 유지 확정
- 완료 조건: 모든 기존 Route가 유지되고 build 성공
- 테스트 방법: `npm run lint`, `npm run build`, 주요 Route 접속 확인
- 위험도: 중간

### PR 5. chore/formatting-check

- 목적: 포맷 기준 도입 여부 검토
- 예상 수정 파일: `package.json`, Prettier 설정 파일
- 작업 내용: Prettier 도입 필요성과 변경 범위 확인
- 선행 결정: 팀이 자동 포맷 도입에 동의
- 완료 조건: 포맷 변경이 과도하지 않음
- 테스트 방법: lint, build, 포맷 결과 확인
- 위험도: 중간

초기 설정, 작업 규칙, 와이어프레임 및 문서화 계획을 정리했습니다. 팀에서 먼저 확정할 항목을 선택해주세요.
