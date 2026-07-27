import { apiClient } from "@/src/lib/apiClient";
import { mockPlaces } from "@/src/mocks/places";
import { mockReviews } from "@/src/mocks/reviews";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=900&q=80",
];

function getFallbackImage(id, isPrivate) {
  if (isPrivate) {
    return "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=80";
  }
  const numericId = typeof id === "number" ? id : parseInt(id, 10) || 0;
  return FALLBACK_IMAGES[numericId % FALLBACK_IMAGES.length];
}

export function formatPlace(raw, isPrivate = false) {
  if (!raw) return null;
  const id = raw.placeId ?? raw.id;
  const name = raw.name ?? "";

  let tags = [];
  if (Array.isArray(raw.tags)) {
    tags = raw.tags.map((t) => (typeof t === "string" ? t : t.name));
  } else if (Array.isArray(raw.tagIds)) {
    tags = raw.tagIds;
  }

  if (tags.length === 0) {
    tags = isPrivate ? ["개인 장소"] : ["분위기 좋은", "추천"];
  }

  return {
    ...raw,
    id: String(id),
    placeId: id,
    name,
    kakaoPlaceId: raw.kakaoPlaceId ?? "",
    visibility: raw.visibility ?? (isPrivate ? "private" : "public"),
    source: raw.source ?? (isPrivate ? "user" : "kakao"),
    category: raw.category ?? (isPrivate ? "culture" : "cafe"),
    categoryLabel: raw.categoryLabel ?? (isPrivate ? "개인 장소" : "카페"),
    tags,
    address: raw.address ?? "서울 마포구",
    lat: Number(raw.lat) || 37.5563,
    lng: Number(raw.lng) || 126.9236,
    rating: raw.rating ?? raw.averageRating ?? 4.5,
    averageRating: raw.averageRating ?? raw.rating ?? 4.5,
    visitCount: raw.visitCount ?? 0,
    reviewCount: raw.reviewCount ?? 0,
    distance: raw.distance ?? "300m",
    description: raw.description || `${name} 장소입니다.`,
    imageUrl: raw.imageUrl || getFallbackImage(id, isPrivate),
    hours: raw.hours ?? "매일 11:00 - 22:00",
  };
}

export async function getPlaces() {
  try {
    const [publicData, privateData] = await Promise.all([
      apiClient("/api/places/public", { fallback: [] }),
      apiClient("/api/places/private", { fallback: [] }),
    ]);

    const formattedPublic = (publicData || []).map((p) => formatPlace(p, false));
    const formattedPrivate = (privateData || []).map((p) => formatPlace(p, true));
    const combined = [...formattedPublic, ...formattedPrivate];

    return combined.length > 0 ? combined : mockPlaces;
  } catch {
    return mockPlaces;
  }
}

export async function getPublicPlaces() {
  try {
    const data = await apiClient("/api/places/public", { fallback: [] });
    const formatted = (data || []).map((p) => formatPlace(p, false));
    return formatted.length > 0 ? formatted : mockPlaces.filter((p) => p.visibility !== "private");
  } catch {
    return mockPlaces.filter((p) => p.visibility !== "private");
  }
}

export async function getPrivatePlaces() {
  try {
    const data = await apiClient("/api/places/private", { fallback: [] });
    const formatted = (data || []).map((p) => formatPlace(p, true));
    return formatted.length > 0 ? formatted : mockPlaces.filter((p) => p.visibility === "private");
  } catch {
    return mockPlaces.filter((p) => p.visibility === "private");
  }
}

export async function getPlaceById(placeId) {
  const fallback = mockPlaces.find((p) => String(p.id) === String(placeId)) ?? mockPlaces[0];
  try {
    const isNum = !isNaN(Number(placeId));
    if (isNum) {
      try {
        const publicRes = await apiClient(`/api/places/public/${placeId}`, { fallback: null });
        if (publicRes) return formatPlace(publicRes, false);
      } catch {}

      try {
        const privateRes = await apiClient(`/api/places/private/${placeId}`, { fallback: null });
        if (privateRes) return formatPlace(privateRes, true);
      } catch {}
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export async function getPublicPlaceById(placeId) {
  const fallback = mockPlaces.find((p) => String(p.id) === String(placeId)) ?? mockPlaces[0];
  try {
    const isNum = !isNaN(Number(placeId));
    if (isNum) {
      const publicRes = await apiClient(`/api/places/public/${placeId}`, { fallback: null });
      if (publicRes) return formatPlace(publicRes, false);
    }
    return getPlaceById(placeId);
  } catch {
    return fallback;
  }
}

export async function getPlaceReviews(placeId) {
  const fallback = mockReviews.filter((review) => String(review.placeId) === String(placeId));
  const finalFallback = fallback.length > 0 ? fallback : mockReviews.slice(0, 2);

  try {
    const userReviews = await apiClient("/api/users/me/reviews", { fallback: [] });
    if (Array.isArray(userReviews) && userReviews.length > 0) {
      const filtered = userReviews
        .filter((r) => String(r.placeId) === String(placeId))
        .map((r) => ({
          id: String(r.reviewId),
          reviewId: r.reviewId,
          placeId: String(r.placeId),
          title: r.title,
          memory: r.title,
          review: r.title,
          date: r.createdAt ? new Date(r.createdAt).toISOString().split("T")[0].replace(/-/g, ".") : "2024.05.20",
          companion: r.companion,
          keywords: r.keywords || [],
          atmosphereTags: r.atmosphereTags || [],
          images: r.imageUrls || [],
        }));
      if (filtered.length > 0) return filtered;
    }
    return finalFallback;
  } catch {
    return finalFallback;
  }
}

export async function createPlace(payload) {
  const isPrivate = payload.visibility === "private";
  const endpoint = isPrivate ? "/api/places/private" : "/api/admin/places";

  const body = isPrivate
    ? {
        name: payload.name,
        address: payload.address || "서울 마포구",
        lat: Number(payload.lat) || 37.5563,
        lng: Number(payload.lng) || 126.9236,
      }
    : {
        name: payload.name,
        kakaoPlaceId: payload.kakaoPlaceId || `kakao-${Date.now()}`,
        address: payload.address || "서울 마포구",
        lat: Number(payload.lat) || 37.5563,
        lng: Number(payload.lng) || 126.9236,
      };

  const res = await apiClient(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
    fallback: {
      ...mockPlaces[0],
      ...payload,
      id: `mock-${Date.now()}`,
    },
  });

  return formatPlace({ ...payload, ...res }, isPrivate);
}

export async function updatePlace(placeId, payload) {
  const body = {
    name: payload.name,
    address: payload.address || "서울 마포구",
    lat: Number(payload.lat) || 37.5563,
    lng: Number(payload.lng) || 126.9236,
  };

  const isPrivate = payload.visibility === "private";
  const primaryEndpoint = isPrivate ? `/api/places/private/${placeId}` : `/api/admin/places/${placeId}`;
  const secondaryEndpoint = isPrivate ? `/api/admin/places/${placeId}` : `/api/places/private/${placeId}`;

  try {
    const res = await apiClient(primaryEndpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return formatPlace({ ...payload, ...res }, isPrivate);
  } catch {
    try {
      const res = await apiClient(secondaryEndpoint, {
        method: "PUT",
        body: JSON.stringify(body),
      });
      return formatPlace({ ...payload, ...res }, !isPrivate);
    } catch {
      return formatPlace({ id: placeId, ...payload }, isPrivate);
    }
  }
}

export async function deletePlace(placeId) {
  try {
    await apiClient(`/api/admin/places/${placeId}`, { method: "DELETE" });
  } catch {
    try {
      await apiClient(`/api/places/private/${placeId}`, { method: "DELETE" });
    } catch {}
  }
}

export async function getExploreRecommendations(tagIds = []) {
  if (!tagIds || tagIds.length === 0) return getPlaces();
  try {
    const query = tagIds.map((id) => `tagIds=${id}`).join("&");
    const data = await apiClient(`/api/recommendations/explore?${query}`, { fallback: [] });
    const formatted = (data || []).map((p) => formatPlace(p, false));
    return formatted.length > 0 ? formatted : mockPlaces;
  } catch {
    return mockPlaces;
  }
}

