# Project Setup Audit

## Summary

현재 프로젝트는 Vite, React, React Router, Tailwind CSS 기반으로 실행과 빌드가 가능한 상태입니다. 이번 주에는 신규 기능보다 초기 설정, 작업 규칙, 문서화, Figma 와이어프레임 정리가 우선입니다.

## Checklist

| 항목 | 현재 상태 | 문제점 | 권장 설정 | 적용 필요 | 영향 범위 |
| --- | --- | --- | --- | --- | --- |
| package scripts | `dev`, `build`, `preview`, `lint` 존재 | type check 전용 스크립트 없음 | TypeScript 재도입 시 `typecheck` 추가 | 낮음 | 개발 검증 |
| Node / package manager | `package-lock.json` 기준 npm 사용 | Node 버전 명시 없음 | README에 Node 20+ 권장 명시 검토 | 낮음 | 온보딩 |
| TypeScript | 현재 main은 JS/JSX 중심 | 타입 안정성은 약해짐 | 안정화 후 TS 재도입 여부 결정 | 중간 | 타입 안정성 |
| ESLint | `eslint src` 적용 | React/Vite 세부 규칙은 단순함 | 현재는 유지, 팀 합의 후 확장 | 낮음 | 코드 품질 |
| Prettier | 설정 없음 | 포맷 기준이 사람마다 달라질 수 있음 | Prettier 도입 권장 | 중간 | 협업 |
| Tailwind CSS | Tailwind v4 PostCSS 구성 | 색상 토큰 문서 부족 | `src/index.css` 기준 토큰 설명 문서화 | 낮음 | UI 일관성 |
| alias | `@/*`, `next/*` 호환 alias 존재 | Next 마이그레이션 잔여 import가 혼란 가능 | 새 코드는 React Router 기준 작성 | 중간 | 유지보수 |
| 환경변수 | Vite 기준 `VITE_PUBLIC_*` 사용 | 기존 Next 변수명과 혼재 가능 | `.env.example` 기준으로 통일 | 완료 | 온보딩 |
| `.gitignore` | `.env*`, `node_modules`, build output 제외 | 큰 문제 없음 | 유지 | 불필요 | 저장소 안전성 |
| README | LOCA와 Vite 기준으로 갱신 | 팀 결정이 바뀌면 재수정 필요 | 현재 main 기준 유지 | 완료 | 발표, 온보딩 |
| 폴더 구조 | `src/pages`와 React Router 중심, Next 잔여 파일 일부 존재 | 마이그레이션 과도기라 혼란 가능 | 다음 PR에서 Next 잔여 파일 정리 | 높음 | 라우팅, 유지보수 |
| import 정렬 | 자동 정렬 도구 없음 | 리뷰 때 스타일 논쟁 가능 | Prettier 우선, import 정렬은 나중에 검토 | 낮음 | 코드 스타일 |
| 네이밍 | 대체로 PascalCase/camelCase 사용 | 문서화 필요 | `docs/FRONTEND_GUIDE.md` 기준 적용 | 완료 | 협업 |
| build / lint | 둘 다 성공 | 없음 | PR 체크리스트에 필수 확인 | 완료 | 품질 관리 |

## Current Verification

- `npm run lint`: 성공
- `npm run build`: 성공

## Recommended First Cleanup

1. Vite 전환을 최종 유지할지 팀 확정
2. Next 호환 import와 잔여 파일 정리
3. README와 문서 구조 확정
4. PR / Issue 템플릿 적용
5. Prettier 도입 여부 결정
6. Figma Low-Fidelity Wireframe으로 사용자 흐름 확정
