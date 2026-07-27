import { apiClient } from "@/src/lib/apiClient";
import { mockReviews } from "@/src/mocks/reviews";

function toBackendCompanion(val) {
  if (!val) return "ALONE";
  const s = String(val).toLowerCase();
  if (s.includes("혼자") || s === "alone") return "ALONE";
  if (s.includes("친구") || s === "friend") return "FRIEND";
  if (s.includes("데이트") || s === "lover" || s === "date") return "LOVER";
  if (s.includes("가족") || s === "family") return "FAMILY";
  return "ETC";
}

function toUiCompanion(enumVal) {
  switch (enumVal) {
    case "ALONE":
      return "혼자";
    case "FRIEND":
      return "친구와";
    case "LOVER":
      return "데이트";
    case "FAMILY":
      return "가족";
    default:
      return "기타";
  }
}

export function formatReview(raw) {
  if (!raw) return null;
  const id = raw.reviewId ?? raw.visitId ?? raw.id;
  return {
    ...raw,
    id: String(id),
    reviewId: id,
    visitId: id,
    placeId: String(raw.placeId ?? "101"),
    placeName: raw.placeName ?? "추천 장소",
    title: raw.title ?? "",
    companion: toUiCompanion(raw.companion),
    companionEnum: raw.companion,
    keywords: raw.keywords ?? [],
    atmosphereTags: raw.atmosphereTags ?? [],
    memory: raw.title ?? "",
    review: raw.title ?? "",
    images: raw.imageUrls ?? [],
    date: raw.createdAt
      ? new Date(raw.createdAt).toISOString().split("T")[0].replace(/-/g, ".")
      : "2024.05.20",
  };
}

export async function getPlaceReviews(placeId) {
  const fallback = mockReviews.filter((review) => String(review.placeId) === String(placeId));
  const finalFallback = fallback.length > 0 ? fallback : mockReviews.slice(0, 2);

  try {
    const userReviews = await apiClient("/api/users/me/reviews", { fallback: [] });
    if (Array.isArray(userReviews) && userReviews.length > 0) {
      const filtered = userReviews
        .filter((r) => String(r.placeId) === String(placeId))
        .map(formatReview);
      if (filtered.length > 0) return filtered;
    }
    return finalFallback;
  } catch {
    return finalFallback;
  }
}

export async function getReviewsMe() {
  try {
    const res = await apiClient("/api/users/me/reviews", { fallback: [] });
    if (Array.isArray(res) && res.length > 0) {
      return res.map(formatReview);
    }
    return mockReviews;
  } catch {
    return mockReviews;
  }
}

export async function getReviewById(visitId) {
  try {
    const res = await apiClient(`/api/users/me/reviews/${visitId}`);
    return formatReview(res);
  } catch {
    return mockReviews[0];
  }
}

export async function createReview(payload) {
  const companionEnum = toBackendCompanion(payload.companion);
  const numericPlaceId = typeof payload.placeId === "number" ? payload.placeId : (parseInt(payload.placeId, 10) || 101);

  const body = {
    placeId: numericPlaceId,
    title: payload.title || payload.review || "장소 방문 기록",
    companion: companionEnum,
    keywords: payload.keywords?.length ? payload.keywords : [payload.companion || "혼자"],
    atmosphereTags: payload.atmosphereTags?.length ? payload.atmosphereTags : ["분위기"],
    imageUrls: payload.images || [],
  };

  const res = await apiClient("/api/users/me/reviews", {
    method: "POST",
    body: JSON.stringify(body),
    fallback: {
      reviewId: `review-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...body,
    },
  });

  return formatReview(res);
}

export async function updateReview(visitId, payload) {
  const companionEnum = toBackendCompanion(payload.companion);
  const numericPlaceId = typeof payload.placeId === "number" ? payload.placeId : (parseInt(payload.placeId, 10) || 101);

  const body = {
    placeId: numericPlaceId,
    title: payload.title || payload.review || "장소 방문 기록",
    companion: companionEnum,
    keywords: payload.keywords || [],
    atmosphereTags: payload.atmosphereTags || [],
    imageUrls: payload.images || [],
  };

  const res = await apiClient(`/api/users/me/reviews/${visitId}`, {
    method: "PUT",
    body: JSON.stringify(body),
    fallback: {
      reviewId: visitId,
      createdAt: new Date().toISOString(),
      ...body,
    },
  });

  return formatReview(res);
}

export async function deleteReview(visitId) {
  await apiClient(`/api/users/me/reviews/${visitId}`, {
    method: "DELETE",
    fallback: undefined,
  });
}

