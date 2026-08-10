import { apiClient } from "@/src/lib/apiClient";
import { mockReviews } from "@/src/mocks/reviews";

const COMPANION_TO_API = {
  alone: "ALONE",
  friend: "FRIEND",
  lover: "LOVER",
  date: "LOVER",
  family: "FAMILY",
};

const COMPANION_TO_UI = {
  ALONE: "혼자",
  FRIEND: "친구와",
  LOVER: "데이트",
  FAMILY: "가족",
  ETC: "기타",
};

function toBackendCompanion(value) {
  if (!value) return "ALONE";
  const normalized = String(value).toLowerCase();

  if (normalized.includes("혼자")) return "ALONE";
  if (normalized.includes("친구")) return "FRIEND";
  if (normalized.includes("데이트")) return "LOVER";
  if (normalized.includes("가족")) return "FAMILY";

  return COMPANION_TO_API[normalized] ?? "ETC";
}

function toUiCompanion(value) {
  return COMPANION_TO_UI[value] ?? COMPANION_TO_UI.ETC;
}

function formatDate(createdAt) {
  if (!createdAt) return "2024.05.20";
  return new Date(createdAt).toISOString().split("T")[0].replace(/-/g, ".");
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
    date: formatDate(raw.createdAt),
  };
}

export async function getPlaceReviews(placeId) {
  const fallback = mockReviews.filter((review) => String(review.placeId) === String(placeId));
  const finalFallback = fallback.length > 0 ? fallback : mockReviews.slice(0, 2);

  try {
    const userReviews = await apiClient("/api/users/me/reviews", { fallback: [] });
    if (Array.isArray(userReviews) && userReviews.length > 0) {
      const filtered = userReviews
        .filter((review) => String(review.placeId) === String(placeId))
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
    const reviews = await apiClient("/api/users/me/reviews", { fallback: [] });
    if (Array.isArray(reviews) && reviews.length > 0) {
      return reviews.map(formatReview);
    }

    return mockReviews;
  } catch {
    return mockReviews;
  }
}

export async function getReviewById(visitId) {
  try {
    const review = await apiClient(`/api/users/me/reviews/${visitId}`);
    return formatReview(review);
  } catch {
    return mockReviews[0];
  }
}

function buildReviewBody(payload) {
  const numericPlaceId =
    typeof payload.placeId === "number"
      ? payload.placeId
      : parseInt(payload.placeId, 10) || 101;

  return {
    placeId: numericPlaceId,
    title: payload.title || payload.review || "장소 방문 기록",
    companion: toBackendCompanion(payload.companion),
    keywords: payload.keywords?.length ? payload.keywords : [payload.companion || "혼자"],
    atmosphereTags: payload.atmosphereTags?.length ? payload.atmosphereTags : ["분위기"],
    imageUrls: payload.images || [],
  };
}

export async function createReview(payload) {
  const body = buildReviewBody(payload);

  const review = await apiClient("/api/users/me/reviews", {
    method: "POST",
    body: JSON.stringify(body),
    fallback: {
      reviewId: `review-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...body,
    },
  });

  return formatReview(review);
}

export async function updateReview(visitId, payload) {
  const body = buildReviewBody(payload);

  const review = await apiClient(`/api/users/me/reviews/${visitId}`, {
    method: "PUT",
    body: JSON.stringify(body),
    fallback: {
      reviewId: visitId,
      createdAt: new Date().toISOString(),
      ...body,
    },
  });

  return formatReview(review);
}

export async function deleteReview(visitId) {
  await apiClient(`/api/users/me/reviews/${visitId}`, {
    method: "DELETE",
    fallback: undefined,
  });
}
