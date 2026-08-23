const rawBaseUrl = import.meta.env.VITE_PUBLIC_API_BASE_URL || "https://sixth-loca-backend-9.onrender.com";
const normalizedBaseUrl = rawBaseUrl.startsWith("http://") || rawBaseUrl.startsWith("https://")
  ? rawBaseUrl
  : `https://${rawBaseUrl}`;
const BASE_DOMAIN = normalizedBaseUrl.replace(/\/swagger-ui\/?$/, "").replace(/\/+$/, "");

// ─────────────────────────────────────────────
// 세션 메모리 캐시 (브라우저 탭이 유지되는 동안 유효)
// 동일 API를 여러 페이지에서 중복 호출하는 것을 방지합니다.
// ─────────────────────────────────────────────
const _cache = {};

/**
 * TTL 기반 캐시 래퍼. 유효 기간 내라면 캐시된 결과를 즉시 반환하고,
 * 만료되었거나 처음 요청이라면 fetcher()를 실행 후 결과를 캐시합니다.
 * @param {string} key 캐시 키
 * @param {number} ttlMs TTL (밀리초)
 * @param {() => Promise<any>} fetcher 실제 API 호출 함수
 */
function withCache(key, ttlMs, fetcher) {
  const now = Date.now();
  if (_cache[key] && _cache[key].data !== undefined && (now - _cache[key].ts) < ttlMs) {
    return Promise.resolve(_cache[key].data);
  }
  // 동일한 키로 이미 진행 중인 비동기 요청이 있다면 중복 호출 없이 해당 Promise 반환
  if (_cache[key] && _cache[key].promise) {
    return _cache[key].promise;
  }

  const promise = fetcher()
    .then((data) => {
      _cache[key] = { data, ts: Date.now() };
      return data;
    })
    .catch((err) => {
      delete _cache[key];
      throw err;
    });

  _cache[key] = { promise };
  return promise;
}


/**
 * 특정 캐시 키를 즉시 무효화합니다.
 * 리뷰 작성/삭제 등 데이터 변경 후 호출해야 합니다.
 * @param {string} key 무효화할 캐시 키 (예: "myReviews")
 */
export function invalidateCache(key) {
  delete _cache[key];
}


function getApiUrl(path) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      import.meta.env.DEV)
  ) {
    return cleanPath;
  }
  return `${BASE_DOMAIN}${cleanPath}`;
}



// 인증 만료(401 Unauthorized) 시 안전하게 온보딩으로 이동시키는 헬퍼 함수
function handleAuthOrNetworkError(status) {
  if (typeof window !== "undefined") {
    // 401 Unauthorized (토큰이 유효하지 않거나 만료됨) 일 때만 토큰 정리 및 리다이렉트
    if (status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("isAdmin");

      // 현재 온보딩/로그인/회원가입 페이지가 아니라면 온보딩으로 리다이렉트
      const pathname = window.location.pathname;
      if (!["/onboarding", "/login", "/signup"].includes(pathname)) {
        window.location.replace("/onboarding");
      }
    }
  }
}

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

// 공통 fetch 래퍼 함수 (401 Unauthorized 인증 만료 시에만 온보딩 리다이렉트)
export async function apiFetch(url, options = {}) {
  try {
    const response = await fetch(url, options);

    // 401 Unauthorized 시 온보딩 리다이렉트
    if (response.status === 401) {
      handleAuthOrNetworkError(401);
    }

    return response;
  } catch (networkError) {
    console.error("Backend connection failure:", networkError);
    throw new Error("서버와의 연결이 원활하지 않습니다.");
  }
}


// 회원가입 API 호출 (/api/auth/signup) -> email, password 전송
export async function signupUser({ email, password }) {
  const url = getApiUrl("/api/auth/signup");

  const response = await apiFetch(url, {
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
  const url = getApiUrl("/api/auth/login");

  const response = await apiFetch(url, {
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

// 추천 장소 API 호출 (/api/recommendations/explore?tagIds=1&page=0&size=20) -> JWT Bearer 토큰 연동
export async function fetchExploreRecommendations(tagIds = [1], page = 0, size = 20) {
  const queryParams = new URLSearchParams();

  const activeTags = Array.isArray(tagIds) && tagIds.length > 0
    ? tagIds
    : (tagIds !== undefined && tagIds !== null && tagIds !== "" ? [tagIds] : [1]);

  activeTags.forEach((id) => {
    if (id !== undefined && id !== null && id !== "") {
      queryParams.append("tagIds", id.toString());
    }
  });

  if (page !== undefined && page !== null) queryParams.append("page", page.toString());
  if (size !== undefined && size !== null) queryParams.append("size", size.toString());

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
  const url = getApiUrl(`/api/recommendations/explore${queryString}`);


  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await apiFetch(url, {
    method: "GET",
    headers: headers,
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "추천 장소 요청 실패");
    throw new Error(errorMsg);
  }

  const data = await response.json();
  if (data && Array.isArray(data.content)) {
    return {
      content: data.content,
      page: data.page ?? page,
      size: data.size ?? size,
      hasNext: Boolean(data.hasNext),
    };
  }
  if (Array.isArray(data)) {
    return {
      content: data,
      page: 0,
      size: data.length,
      hasNext: false,
    };
  }
  return {
    content: [],
    page: 0,
    size: 20,
    hasNext: false,
  };
}

// 공용 장소 상세 조회 API 호출 (/api/places/public/{placeId}) -> JWT Bearer 토큰 연동
export async function fetchPublicPlaceDetail(placeId) {
  const url = getApiUrl(`/api/places/public/${placeId}`);

  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await apiFetch(url, {
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
  const url = getApiUrl("/api/places/custom");

  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await apiFetch(url, {
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
  const url = getApiUrl("/api/places/custom");

  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("로그인이 필요합니다. 로그인 후 이용해주세요.");
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  const response = await apiFetch(url, {
    method: "GET",
    headers: headers,
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "개인 장소 목록 조회 실패");
    throw new Error(errorMsg);
  }

  const data = await response.json();
  if (data && Array.isArray(data.content)) {
    return data.content;
  }
  if (Array.isArray(data)) {
    return data;
  }
  return [];
}

// 내 커스텀/개인 장소 단건 조회 API 호출 (GET /api/places/custom/{placeId})
export async function fetchPrivatePlaceDetail(placeId) {
  const url = getApiUrl(`/api/places/custom/${placeId}`);

  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await apiFetch(url, {
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
  const url = getApiUrl(`/api/places/custom/${placeId}`);

  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await apiFetch(url, {
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
  const url = getApiUrl(`/api/places/custom/${placeId}`);

  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await apiFetch(url, {
    method: "DELETE",
    headers: headers,
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "개인 장소 삭제 실패");
    throw new Error(errorMsg);
  }

  return true;
}

// 전체 공용 장소 목록 조회 API 호출 (GET /api/places/public?page=0&size=20) -> JWT Bearer 토큰 연동
export function fetchPublicPlaces(page = 0, size = 20) {
  return withCache(`publicPlaces:${page}:${size}`, 3 * 60 * 1000, async () => {
    const queryParams = new URLSearchParams();
    if (page !== undefined && page !== null) queryParams.append("page", page.toString());
    if (size !== undefined && size !== null) queryParams.append("size", size.toString());
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

    const url = getApiUrl(`/api/places/public${queryString}`);

    const token = localStorage.getItem("accessToken");
    const headers = { "Content-Type": "application/json" };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await apiFetch(url, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      const errorMsg = await extractErrorMessage(response, "공용 장소 목록 조회 실패");
      throw new Error(errorMsg);
    }

    const data = await response.json();
    // Spring Page 응답 구조 ({ content: [...], page, size, hasNext, totalPages })
    if (data && Array.isArray(data.content)) {
      return {
        content: data.content,
        page: data.page ?? page,
        size: data.size ?? size,
        hasNext: Boolean(data.hasNext),
        totalPages: data.totalPages ?? (data.hasNext ? page + 2 : page + 1),
      };
    }
    if (Array.isArray(data)) {
      return {
        content: data,
        page: 0,
        size: data.length,
        hasNext: false,
        totalPages: 1,
      };
    }
    return {
      content: [],
      page: 0,
      size: 20,
      hasNext: false,
      totalPages: 1,
    };
  });
}


// [어드민 API] 공용 장소 신규 등록 (POST /api/admin/places)
export async function createAdminPlace({ name, kakaoPlaceId, address, lat, lng }) {
  const url = getApiUrl("/api/admin/places");

  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await apiFetch(url, {
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
  const url = getApiUrl(`/api/admin/places/${placeId}`);

  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await apiFetch(url, {
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
  const url = getApiUrl(`/api/admin/places/${placeId}`);

  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await apiFetch(url, {
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
  const url = getApiUrl("/api/recommendations/for-you/status");

  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("로그인이 필요합니다. 로그인 후 이용해주세요.");
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  const response = await apiFetch(url, {
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
  const url = getApiUrl("/api/recommendations/for-you");

  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("로그인이 필요합니다. 로그인 후 이용해주세요.");
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  };

  const response = await apiFetch(url, {
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
export function fetchMyReviews() {
  return withCache("myReviews", 60 * 1000, async () => {
    const url = getApiUrl("/api/users/me/reviews");

    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("로그인이 필요합니다. 로그인 후 이용해주세요.");
    }

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };

    const response = await apiFetch(url, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      const errorMsg = await extractErrorMessage(response, "내 리뷰 목록 조회 실패");
      throw new Error(errorMsg);
    }

    return await response.json();
  });
}


// 특정 리뷰 상세 조회 API 호출 (GET /api/users/me/reviews/{visitId}) -> JWT Bearer 토큰 필요
export async function fetchReviewDetail(visitId) {
  const url = getApiUrl(`/api/users/me/reviews/${visitId}`);

  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("로그인이 필요합니다. 로그인 후 이용해주세요.");
  }

  const response = await apiFetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "리뷰 상세 조회 실패");
    throw new Error(errorMsg);
  }

  return await response.json();
}

// 특정 장소에 등록된 리뷰 목록 조회 API 호출 (GET /api/places/{placeId}/reviews?page={page})
export async function fetchPlaceReviews(placeId, page = 0) {
  const url = getApiUrl(`/api/places/${placeId}/reviews?page=${page}`);

  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await apiFetch(url, {
    method: "GET",
    headers: headers,
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "장소 리뷰 목록 조회 실패");
    throw new Error(errorMsg);
  }

  const data = await response.json();
  // SliceResponsePlaceReviewResponse: { content: Array, page: number, size: number, hasNext: boolean }
  if (Array.isArray(data)) {
    return {
      content: data,
      page: 0,
      size: data.length,
      hasNext: false,
    };
  }
  return {
    content: data?.content || [],
    page: data?.page ?? 0,
    size: data?.size ?? 20,
    hasNext: Boolean(data?.hasNext),
  };
}

// 리뷰 삭제 API 호출 (DELETE /api/users/me/reviews/{visitId})
export async function deleteReview(visitId) {
  const url = getApiUrl(`/api/users/me/reviews/${visitId}`);

  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("로그인이 필요합니다. 로그인 후 이용해주세요.");
  }

  const response = await apiFetch(url, {
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

  // 리뷰 삭제 성공 시 캐시 무효화
  invalidateCache("myReviews");
  return true;
}


// 리뷰 이미지 업로드 API 호출 (POST /api/users/me/review-images) -> multipart/form-data
export async function uploadReviewImage(file) {
  const url = getApiUrl("/api/users/me/review-images");

  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("로그인이 필요합니다. 로그인 후 이용해주세요.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Note: Do NOT set Content-Type header manually when sending FormData,
      // the browser will automatically set it with boundary
    },
    body: formData,
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "이미지 업로드 실패");
    throw new Error(errorMsg);
  }

  // Swagger schema: ImageUploadResponse { imageUrl: string }
  const data = await response.json();
  return data.imageUrl || data;
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
  const url = getApiUrl("/api/users/me/reviews");

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

  const response = await apiFetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(bodyData),
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "리뷰 등록 실패");
    throw new Error(errorMsg);
  }

  // 리뷰 등록 성공 시 캐시 무효화 (다음 fetchMyReviews 호출 시 최신 데이터 반영)
  invalidateCache("myReviews");
  return await response.json();
}


// 전체 태그 목록 조회 API 호출 (GET /api/tags) -> JWT Bearer 토큰 필요
export function fetchTags() {
  return withCache("tags", 5 * 60 * 1000, async () => {
    const url = getApiUrl("/api/tags");

    const token = localStorage.getItem("accessToken");
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await apiFetch(url, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      const errorMsg = await extractErrorMessage(response, "태그 목록 조회 실패");
      throw new Error(errorMsg);
    }

    return await response.json();
  });
}


// [어드민 API] 신규 태그 추가 (POST /api/admin/tags)
export async function createAdminTag({ name }) {
  const url = getApiUrl("/api/admin/tags");

  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await apiFetch(url, {
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
  const url = getApiUrl(`/api/admin/tags/${tagId}`);

  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await apiFetch(url, {
    method: "DELETE",
    headers: headers,
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "태그 삭제 실패");
    throw new Error(errorMsg);
  }

  return true;
}

// [어드민 API] 태그 수정 (POST / PUT / PATCH /api/admin/tags)
export async function updateAdminTag(tagId, { name, tagName }) {
  const finalName = (name || tagName || "").trim();
  const token = localStorage.getItem("accessToken");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const payload = JSON.stringify({
    name: finalName,
    tagName: finalName,
  });

  // 1. POST /api/admin/tags 또는 POST /api/admin/tags/{tagId} 시도
  let url = getApiUrl(`/api/admin/tags`);
  let response = await apiFetch(url, {
    method: "POST",
    headers: headers,
    body: payload,
  });

  // 2. 만약 405 또는 404 라면 POST /api/admin/tags/{tagId} 시도
  if (response.status === 405 || response.status === 404) {
    url = getApiUrl(`/api/admin/tags/${tagId}`);
    response = await apiFetch(url, {
      method: "POST",
      headers: headers,
      body: payload,
    });
  }

  // 3. 만약 405 라면 PUT /api/admin/tags/{tagId} 시도
  if (response.status === 405) {
    url = getApiUrl(`/api/admin/tags/${tagId}`);
    response = await apiFetch(url, {
      method: "PUT",
      headers: headers,
      body: payload,
    });
  }

  // 4. 만약 405 라면 PATCH /api/admin/tags/{tagId} 시도
  if (response.status === 405) {
    url = getApiUrl(`/api/admin/tags/${tagId}`);
    response = await apiFetch(url, {
      method: "PATCH",
      headers: headers,
      body: payload,
    });
  }

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "태그 수정 실패");
    throw new Error(errorMsg);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }
  return true;
}

// [내 프로필 아이콘 API] 현재 유저 아이콘 ID 조회 (GET /api/users/me/icon)
export async function fetchUserIcon() {
  const url = getApiUrl("/api/users/me/icon");

  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await apiFetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "아이콘 조회 실패");
    throw new Error(errorMsg);
  }

  const data = await response.json();
  // iconId 또는 icon 숫자 형태 파싱
  const iconId = typeof data === "number" ? data : (data?.iconId ?? data?.id ?? data?.icon ?? 1);
  return iconId;
}

// [내 프로필 아이콘 API] 유저 아이콘 ID 수정 (PUT /api/users/me/icon)
export async function updateUserIcon(iconId) {
  const url = getApiUrl("/api/users/me/icon");

  const token = localStorage.getItem("accessToken");
  if (!token) {
    throw new Error("로그인이 필요합니다.");
  }

  const numericId = parseInt(iconId, 10) || 1;

  const response = await apiFetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ iconId: numericId }),
  });

  if (!response.ok) {
    const errorMsg = await extractErrorMessage(response, "아이콘 수정 실패");
    throw new Error(errorMsg);
  }

  try {
    return await response.json();
  } catch {
    return { iconId: numericId };
  }
}
