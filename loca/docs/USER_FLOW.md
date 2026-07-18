# User Flow

## Screen List

| 화면 | 목적 | 핵심 CTA | 진입 경로 | 이동 |
| --- | --- | --- | --- | --- |
| Home | 탐색 시작점 제공 | For You, Explore, Map, Place 등록 | `/` | 추천, 탐색, 지도, 등록 |
| Explore | 장소 목록 탐색 | 장소 선택 | 하단 내비게이션, Home | Place Detail |
| For You | 취향 기반 추천 확인 | 추천 장소 선택 | Home, 하단 내비게이션 | Place Detail |
| Map | 장소를 지도에서 확인 | 마커 선택 | Home, 하단 내비게이션 | Bottom Sheet, Detail, Review |
| Place Detail | 장소 정보 확인 | 기록하기 | 장소 카드, 지도 | Review Write |
| Review Write | 방문 경험 기록 | 저장 | Place Detail, Map Bottom Sheet | My Page |
| My Page | 기록과 저장 장소 확인 | 기록 상세 확인 | 하단 내비게이션 | 추후 상세 |
| Admin | 장소와 태그 관리 | 등록, 수정, 삭제 | 관리자 접근 | Admin Places, Admin Tags |
| Collections | 장소 묶음 확인 | 공유, 코스 보기 | Home | Collection Detail |
| Place New | Private Place 등록 | 저장 | Home, CTA | 추후 Detail |

## Required Interaction Definition

- 버튼 클릭 후 이동할 화면을 Figma Annotation에 명시합니다.
- 저장 성공, 저장 실패, 로딩, Empty 상태를 화면별로 정의합니다.
- Map Bottom Sheet는 마커 선택 시 열리고, 닫기와 상세 이동을 지원합니다.
- Review Write는 저장 성공 시 My Page로 이동합니다.

## Figma Wireframe Targets

1. Home
2. Explore
3. For You
4. Map + Bottom Sheet
5. Place Detail
6. Review Write
7. My Page
8. Place New
9. Collections
10. Admin Places / Tags
