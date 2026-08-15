const BASE_DOMAIN = (import.meta.env.VITE_PUBLIC_API_BASE_URL || "https://sixth-loca-backend-9.onrender.com").replace(/\/swagger-ui\/?$/, "");


// 백엔드 에러 응답 객체/텍스트로부터 실제 메시지를 추출하는 공통 헬퍼 함수
async function extractErrorMessage(response, defaultMsg) {
  try {
    const text = await response.text();
    if (!text) return `${defaultMsg} (${response.status})`;
    try {
      const errorJson = JSON.parse(text);
      if (typeof errorJson === "string") return errorJson;
      if (errorJson.message) return errorJson.message;
      if (errorJson.error) return errorJson.error;
      if (errorJson.detail) return errorJson.detail;
      return JSON.stringify(errorJson);
    } catch {
      // JSON 파싱 불가능한 단순 텍스트 백엔드 응답인 경우
      return text;
    }
  } catch {
    return `${defaultMsg} (${response.status})`;
  }
}

// 회원가입 API 호출 (/api/auth/signup) -> email, password 전송
export async function signupUser({ email, password }) {
  const isDev = import.meta.env.DEV;
  const url = isDev ? "/api/auth/signup" : `${BASE_DOMAIN}/api/auth/signup`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "회원가입 실패");
    throw new Error(errorMsg);
  }

  // 백엔드 응답이 JSON이 아닐 경우 텍스트로 처리
  try {
    return await response.json();
  } catch {
    return true;
  }
}

// 로그인 API 호출 (/api/auth/login) -> JWT 토큰 수신 및 localStorage 저장
export async function loginUser({ email, password }) {
  const isDev = import.meta.env.DEV;
  const url = isDev ? "/api/auth/login" : `${BASE_DOMAIN}/api/auth/login`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "로그인 실패");
    throw new Error(errorMsg);
  }

  const data = await response.json();
  const token = data.token || data.accessToken || data.jwt || (typeof data === "string" ? data : null);

  if (token) {
    localStorage.setItem("accessToken", token);
  }
  if (email) {
    localStorage.setItem("userEmail", email);
  }

  // 백엔드 응답의 isAdmin 플래그 확인 + 관리자 계정 이메일(loca.admin@... 또는 admin@...) 지원
  const isAdmin = Boolean(
    data.isAdmin === true ||
    data.admin === true ||
    data.is_admin === true ||
    data.role === "ADMIN" ||
    data.role === "ROLE_ADMIN" ||
    (data.roles && data.roles.includes("ADMIN")) ||
    (email && (email.toLowerCase().includes("admin") || email.toLowerCase().startsWith("loca.admin")))
  );
  localStorage.setItem("isAdmin", isAdmin ? "true" : "false");

  return data;
}

// 추천 장소 API 호출 (/api/recommendations/explore?tagIds=1) -> JWT Bearer 토큰 연동
export async function fetchExploreRecommendations(tagIds = [1]) {
  const isDev = import.meta.env.DEV;
  const queryString = Array.isArray(tagIds) && tagIds.length > 0 
    ? `?tagIds=${tagIds.join("&tagIds=")}` 
    : "?tagIds=1";

  const url = isDev 
    ? `/api/recommendations/explore${queryString}` 
    : `${BASE_DOMAIN}/api/recommendations/explore${queryString}`;

  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: headers,
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "추천 장소 요청 실패");
    throw new Error(errorMsg);
  }

  return await response.json();
}

// 공용 장소 상세 조회 API 호출 (/api/places/public/{placeId}) -> JWT Bearer 토큰 연동
export async function fetchPublicPlaceDetail(placeId) {
  const isDev = import.meta.env.DEV;
  const url = isDev
    ? `/api/places/public/${placeId}`
    : `${BASE_DOMAIN}/api/places/public/${placeId}`;

  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: headers,
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "장소 상세 조회 실패");
    throw new Error(errorMsg);
  }

  return await response.json();
}

// 사용자 맞춤/개인 장소 등록 API 호출 (POST /api/places/custom) -> JWT Bearer 토큰 연동
export async function createCustomPlace({ name, address, lat, lng, isShareable }) {
  const isDev = import.meta.env.DEV;
  const url = isDev ? "/api/places/custom" : `${BASE_DOMAIN}/api/places/custom`;

  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      name,
      address,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      isShareable: Boolean(isShareable),
    }),
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "장소 등록 실패");
    throw new Error(errorMsg);
  }

  return await response.json();
}

// 내 커스텀/개인 장소 목록 조회 API 호출 (GET /api/places/custom) -> JWT Bearer 토큰 연동
export async function fetchPrivatePlaces() {
  const isDev = import.meta.env.DEV;
  const url = isDev ? "/api/places/custom" : `${BASE_DOMAIN}/api/places/custom`;

  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("로그인이 필요합니다. 로그인 후 이용해주세요.");
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  const response = await fetch(url, {
    method: "GET",
    headers: headers,
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "개인 장소 목록 조회 실패");
    throw new Error(errorMsg);
  }

  return await response.json();
}

// 내 커스텀/개인 장소 단건 조회 API 호출 (GET /api/places/custom/{placeId})
export async function fetchPrivatePlaceDetail(placeId) {
  const isDev = import.meta.env.DEV;
  const url = isDev ? `/api/places/custom/${placeId}` : `${BASE_DOMAIN}/api/places/custom/${placeId}`;

  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: headers,
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "개인 장소 조회 실패");
    throw new Error(errorMsg);
  }

  return await response.json();
}

// 내 커스텀/개인 장소 수정 API 호출 (PUT /api/places/custom/{placeId})
export async function updatePrivatePlace(placeId, { name, address, lat, lng, isShareable }) {
  const isDev = import.meta.env.DEV;
  const url = isDev ? `/api/places/custom/${placeId}` : `${BASE_DOMAIN}/api/places/custom/${placeId}`;

  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify({
      name,
      address,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      isShareable: Boolean(isShareable),
    }),
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "개인 장소 수정 실패");
    throw new Error(errorMsg);
  }

  return await response.json();
}

// 내 커스텀/개인 장소 삭제 API 호출 (DELETE /api/places/custom/{placeId})
export async function deletePrivatePlace(placeId) {
  const isDev = import.meta.env.DEV;
  const url = isDev ? `/api/places/custom/${placeId}` : `${BASE_DOMAIN}/api/places/custom/${placeId}`;

  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "DELETE",
    headers: headers,
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "개인 장소 삭제 실패");
    throw new Error(errorMsg);
  }

  return true;
}

// 전체 공용 장소 목록 조회 API 호출 (GET /api/places/public) -> JWT Bearer 토큰 연동
export async function fetchPublicPlaces() {
  const isDev = import.meta.env.DEV;
  const url = isDev ? "/api/places/public" : `${BASE_DOMAIN}/api/places/public`;

  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: headers,
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "공용 장소 목록 조회 실패");
    throw new Error(errorMsg);
  }

  return await response.json();
}

// [어드민 API] 공용 장소 신규 등록 (POST /api/admin/places)
export async function createAdminPlace({ name, kakaoPlaceId, address, lat, lng }) {
  const isDev = import.meta.env.DEV;
  const url = isDev ? "/api/admin/places" : `${BASE_DOMAIN}/api/admin/places`;

  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      name,
      kakaoPlaceId,
      address,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    }),
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "어드민 장소 등록 실패");
    throw new Error(errorMsg);
  }

  return await response.json();
}

// [어드민 API] 장소 정보 수정 (PUT /api/admin/places/{placeId})
export async function updateAdminPlace(placeId, { name, address, lat, lng }) {
  const isDev = import.meta.env.DEV;
  const url = isDev ? `/api/admin/places/${placeId}` : `${BASE_DOMAIN}/api/admin/places/${placeId}`;

  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify({
      name,
      address,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    }),
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "어드민 장소 수정 실패");
    throw new Error(errorMsg);
  }

  return await response.json();
}

// [어드민 API] 장소 삭제 (DELETE /api/admin/places/{placeId})
export async function deleteAdminPlace(placeId) {
  const isDev = import.meta.env.DEV;
  const url = isDev ? `/api/admin/places/${placeId}` : `${BASE_DOMAIN}/api/admin/places/${placeId}`;

  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "DELETE",
    headers: headers,
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "어드민 장소 삭제 실패");
    throw new Error(errorMsg);
  }

  return true;
}

// [For-You API] 맞춤 추천 잠금/해제 상태 조회 (GET /api/recommendations/for-you/status)
export async function fetchForYouStatus() {
  const isDev = import.meta.env.DEV;
  const url = isDev ? "/api/recommendations/for-you/status" : `${BASE_DOMAIN}/api/recommendations/for-you/status`;

  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("로그인이 필요합니다. 로그인 후 이용해주세요.");
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  const response = await fetch(url, {
    method: "GET",
    headers: headers,
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "추천 상태 조회 실패");
    throw new Error(errorMsg);
  }

  return await response.json();
}

// [For-You API] 맞춤 추천 장소 5개 조회 (GET /api/recommendations/for-you)
export async function fetchForYouRecommendations() {
  const isDev = import.meta.env.DEV;
  const url = isDev ? "/api/recommendations/for-you" : `${BASE_DOMAIN}/api/recommendations/for-you`;

  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("로그인이 필요합니다. 로그인 후 이용해주세요.");
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  const response = await fetch(url, {
    method: "GET",
    headers: headers,
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "맞춤 추천 조회 실패");
    throw new Error(errorMsg);
  }

  return await response.json();
}

// 내 작성 장소/리뷰 목록 조회 API 호출 (GET /api/users/me/reviews)
export async function fetchMyReviews() {
  const isDev = import.meta.env.DEV;
  const url = isDev ? "/api/users/me/reviews" : `${BASE_DOMAIN}/api/users/me/reviews`;

  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("로그인이 필요합니다. 로그인 후 이용해주세요.");
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  const response = await fetch(url, {
    method: "GET",
    headers: headers,
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "내 리뷰 목록 조회 실패");
    throw new Error(errorMsg);
  }

  return await response.json();
}

// 리뷰 삭제 API 호출 (DELETE /api/users/me/reviews/{visitId})
export async function deleteReview(visitId) {
  const isDev = import.meta.env.DEV;
  const url = isDev
    ? `/api/users/me/reviews/${visitId}`
    : `${BASE_DOMAIN}/api/users/me/reviews/${visitId}`;

  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("로그인이 필요합니다. 로그인 후 이용해주세요.");
  }

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "리뷰 삭제 실패");
    throw new Error(errorMsg);
  }

  return true;
}

// 리뷰 등록 API 호출 (POST /api/users/me/reviews) -> JWT Bearer 토큰 연동
export async function createReview({
  placeId,
  title,
  content,
  companion,
  visitedAt,
  keywords,
  tagIds,
  imageUrls,
}) {
  const isDev = import.meta.env.DEV;
  const url = isDev ? "/api/users/me/reviews" : `${BASE_DOMAIN}/api/users/me/reviews`;

  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("로그인이 필요합니다. 로그인 후 이용해주세요.");
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  const bodyData = {
    placeId: parseInt(placeId, 10),
    title: title || "",
    content: content || "",
    companion: companion || "ALONE",
    visitedAt: visitedAt || new Date().toISOString(),
    keywords: Array.isArray(keywords) ? keywords : [],
    tagIds: Array.isArray(tagIds) ? tagIds.map((id) => parseInt(id, 10)) : [],
    imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(bodyData),
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "리뷰 등록 실패");
    throw new Error(errorMsg);
  }

  return await response.json();
}

// 전체 태그 목록 조회 API 호출 (GET /api/tags) -> JWT Bearer 토큰 필요
export async function fetchTags() {
  const isDev = import.meta.env.DEV;
  const url = isDev ? "/api/tags" : `${BASE_DOMAIN}/api/tags`;

  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers: headers,
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "태그 목록 조회 실패");
    throw new Error(errorMsg);
  }

  return await response.json();
}

// [어드민 API] 신규 태그 추가 (POST /api/admin/tags)
export async function createAdminTag({ name }) {
  const isDev = import.meta.env.DEV;
  const url = isDev ? "/api/admin/tags" : `${BASE_DOMAIN}/api/admin/tags`;

  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "태그 생성 실패");
    throw new Error(errorMsg);
  }

  return await response.json();
}

// [어드민 API] 태그 삭제 (DELETE /api/admin/tags/{tagId})
export async function deleteAdminTag(tagId) {
  const isDev = import.meta.env.DEV;
  const url = isDev ? `/api/admin/tags/${tagId}` : `${BASE_DOMAIN}/api/admin/tags/${tagId}`;

  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "DELETE",
    headers: headers,
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "태그 삭제 실패");
    throw new Error(errorMsg);
  }

  return true;
}

// [어드민 API] 태그 수정 (PUT /api/admin/tags/{tagId})
export async function updateAdminTag(tagId, { name }) {
  const isDev = import.meta.env.DEV;
  const url = isDev ? `/api/admin/tags/${tagId}` : `${BASE_DOMAIN}/api/admin/tags/${tagId}`;

  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "태그 수정 실패");
    throw new Error(errorMsg);
  }

  return await response.json();
}
