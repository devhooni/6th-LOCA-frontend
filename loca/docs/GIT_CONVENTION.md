# Git Convention

## Branch Strategy

- `main`: 배포 가능하고 안정적인 버전만 유지
- `develop`: 기능 통합과 테스트 기준 브랜치
- `feature/<name>`: 신규 기능 개발
- `fix/<name>`: 오류 수정
- `refactor/<name>`: 동작 변화 없는 구조 개선
- `design/<name>`: Figma 또는 UI 반영
- `chore/<name>`: 설정, 문서, 의존성 등 기타 작업

예시:

- `feature/map-bottom-sheet`
- `feature/record-form`
- `design/home-wireframe`
- `refactor/place-card`
- `fix/mobile-navigation`
- `chore/github-templates`

현재 팀 규모에서는 `main`, `develop`, `feature/*`, `fix/*`, `design/*`, `chore/*` 정도면 충분합니다. `refactor/*`는 구조 개선 작업이 많아질 때 사용합니다.

## Commit Message

Conventional Commits를 기준으로 작성합니다.

```txt
type(scope): 변경 내용
```

사용 타입:

- `feat`: 기능 추가
- `fix`: 버그 수정
- `refactor`: 기능 변화 없는 구조 개선
- `design`: UI/UX 및 스타일 변경
- `style`: 포맷, 공백 등 동작과 무관한 변경
- `docs`: 문서 변경
- `test`: 테스트 추가 또는 수정
- `chore`: 설정 및 기타 작업
- `build`: 빌드 환경 변경
- `ci`: CI/CD 변경

예시:

- `feat(map): 장소 마커 선택 바텀시트 추가`
- `fix(layout): 모바일 하단 내비게이션 겹침 수정`
- `refactor(place-card): 중복 장소 카드 통합`
- `design(home): 주요 CTA 우선순위 재배치`
- `docs(readme): 프로젝트 실행 방법 추가`
- `chore(github): PR 및 Issue 템플릿 추가`

커밋은 하나의 논리적인 변경 단위로 작성합니다. 기능 구현과 대규모 스타일 수정은 가능한 한 같은 커밋에 섞지 않습니다.

## PR Size

권장 PR 크기:

- 화면 1개 또는 기능 1개 단위
- 리뷰 가능한 파일 5~10개 이내 권장
- 신규 기능, 리팩터링, 스타일 수정은 되도록 분리

큰 PR이 필요할 경우 설명에 영향 범위와 리뷰 우선순위를 명시합니다.
