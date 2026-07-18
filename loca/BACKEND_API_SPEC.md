# LOCA Backend API Request Spec

## Current Frontend Integration

Frontend base URL:

```env
VITE_PUBLIC_API_BASE_URL=http://192.168.164.130:8080
```

Current frontend calls are centralized in:

- `src/lib/apiClient.js`
- `src/services/placeService.js`
- `src/services/tagService.js`
- `src/services/collectionService.js`

If the backend is unreachable, read screens can fall back to mock data so the UI does not break during development.

## Existing Place / Tag APIs Used

### Get Places

`GET /api/places`

Used by:

- `/explore`
- `/map`
- `/admin`
- `/admin/places`

### Get Place Detail

`GET /api/places/{placeId}`

Used by:

- `/place/:id`

### Get Tags

`GET /api/tags`

Used by:

- `/explore`
- `/map`
- `/admin`
- `/admin/places`
- `/admin/tags`

## Existing Admin APIs Used

### Create Place

`POST /api/admin/places`

Used by:

- `/admin/places`
- `/place/new`

Request example:

```json
{
  "kakaoPlaceId": "optional-kakao-id",
  "visibility": "public",
  "source": "kakao",
  "registrationMethod": "manual",
  "name": "장소 이름",
  "category": "cafe",
  "address": "서울 마포구 ...",
  "lat": 37.5563,
  "lng": 126.9236,
  "description": "장소 설명",
  "imageUrl": "https://...",
  "tagIds": ["quiet", "date"]
}
```

### Update Place

`PUT /api/admin/places/{placeId}`

### Delete Place

`DELETE /api/admin/places/{placeId}`

### Create Tag

`POST /api/admin/tags`

### Delete Tag

`DELETE /api/admin/tags/{tagId}`

## Additional APIs Needed

### Public Place / Private Place

The `Place` response should include visibility and source fields.

Recommended filters:

- `GET /api/places?visibility=public`
- `GET /api/places?visibility=private`
- `GET /api/places?source=kakao`
- `GET /api/places?source=user`

### Private Place Registration

Recommended endpoint:

`POST /api/places/private`

### Photo GPS / EXIF Upload

Recommended endpoint:

`POST /api/uploads/place-photo`

Request:

`multipart/form-data`

Fields:

- `file`: image file

### Place Collections

- `GET /api/collections`
- `GET /api/collections/{collectionId}`
- `GET /api/collections/share/{shareSlug}`
- `POST /api/collections`
- `PUT /api/collections/{collectionId}`
- `DELETE /api/collections/{collectionId}`
- `POST /api/collections/{collectionId}/share`

## Review / Local Diary APIs Needed

Recommended endpoint:

`POST /api/reviews`

Recommended list endpoints:

- `GET /api/reviews/me`
- `GET /api/places/{placeId}/reviews`

## Error Handling

Recommended backend errors:

- `409`: duplicate place or duplicate tag
- `400`: invalid request body
- `404`: place, tag, or collection not found
- `500`: server error
