import { apiClient } from "@/src/lib/apiClient";
import { mockPlaces } from "@/src/mocks/places";
import { mockReviews } from "@/src/mocks/reviews";

const DEFAULT_LOCATION = {
  address: "서울 마포구 홍대입구역 근처",
  lat: 37.5563,
  lng: 126.9236,
};

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

function normalizeTags(raw, isPrivate) {
  if (Array.isArray(raw.tags)) {
    return raw.tags.map((tag) => (typeof tag === "string" ? tag : tag.name));
  }

  if (Array.isArray(raw.tagIds)) {
    return raw.tagIds;
  }

  return isPrivate ? ["개인 장소"] : ["분위기 좋은", "추천"];
}

function isNumericId(placeId) {
  return !Number.isNaN(Number(placeId));
}

function findMockPlace(placeId) {
  return mockPlaces.find((place) => String(place.id) === String(placeId)) ?? mockPlaces[0];
}

export function formatPlace(raw, isPrivate = false) {
  if (!raw) return null;

  const id = raw.placeId ?? raw.id;
  const name = raw.name ?? "";

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
    tags: normalizeTags(raw, isPrivate),
    address: raw.address ?? DEFAULT_LOCATION.address,
    lat: Number(raw.lat) || DEFAULT_LOCATION.lat,
    lng: Number(raw.lng) || DEFAULT_LOCATION.lng,
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
      apiClient("/api/places/public"),
      apiClient("/api/places/private"),
    ]);

    const publicPlaces = Array.isArray(publicData)
      ? publicData.map((place) => formatPlace(place, false))
      : [];
    const privatePlaces = Array.isArray(privateData)
      ? privateData.map((place) => formatPlace(place, true))
      : [];

    return [...publicPlaces, ...privatePlaces];
  } catch {
    return mockPlaces;
  }
}

export async function getPublicPlaces() {
  try {
    const places = await apiClient("/api/places/public");
    return Array.isArray(places) ? places.map((place) => formatPlace(place, false)) : [];
  } catch {
    return mockPlaces.filter((place) => place.visibility !== "private");
  }
}

export async function getPrivatePlaces() {
  try {
    const places = await apiClient("/api/places/private");
    return Array.isArray(places) ? places.map((place) => formatPlace(place, true)) : [];
  } catch {
    return mockPlaces.filter((place) => place.visibility === "private");
  }
}

export async function getPlaceById(placeId) {
  try {
    if (isNumericId(placeId)) {
      try {
        const publicPlace = await apiClient(`/api/places/public/${placeId}`);
        if (publicPlace) return formatPlace(publicPlace, false);
      } catch {}

      try {
        const privatePlace = await apiClient(`/api/places/private/${placeId}`);
        if (privatePlace) return formatPlace(privatePlace, true);
      } catch {}
    }

    return findMockPlace(placeId);
  } catch {
    return findMockPlace(placeId);
  }
}

export async function getPublicPlaceById(placeId) {
  try {
    if (isNumericId(placeId)) {
      const publicPlace = await apiClient(`/api/places/public/${placeId}`);
      if (publicPlace) return formatPlace(publicPlace, false);
    }

    return getPlaceById(placeId);
  } catch {
    return findMockPlace(placeId);
  }
}

export async function getPlaceReviews(placeId) {
  try {
    const userReviews = await apiClient("/api/users/me/reviews");

    if (Array.isArray(userReviews)) {
      return userReviews
        .filter((review) => String(review.placeId) === String(placeId))
        .map((review) => ({
          id: String(review.reviewId),
          reviewId: review.reviewId,
          placeId: String(review.placeId),
          title: review.title,
          memory: review.title,
          review: review.title,
          date: review.createdAt
            ? new Date(review.createdAt).toISOString().split("T")[0].replace(/-/g, ".")
            : "2024.05.20",
          companion: review.companion,
          keywords: review.keywords || [],
          atmosphereTags: review.atmosphereTags || [],
          images: review.imageUrls || [],
        }));
    }

    return mockReviews.filter((review) => String(review.placeId) === String(placeId));
  } catch {
    return mockReviews.filter((review) => String(review.placeId) === String(placeId));
  }
}

function buildPlaceBody(payload, isPrivate) {
  const baseBody = {
    name: payload.name,
    address: payload.address || DEFAULT_LOCATION.address,
    lat: Number(payload.lat) || DEFAULT_LOCATION.lat,
    lng: Number(payload.lng) || DEFAULT_LOCATION.lng,
  };

  if (isPrivate) return baseBody;

  return {
    ...baseBody,
    kakaoPlaceId: payload.kakaoPlaceId || `kakao-${Date.now()}`,
  };
}

export async function createPlace(payload) {
  const isPrivate = payload.visibility === "private";
  const endpoint = isPrivate ? "/api/places/private" : "/api/admin/places";

  const createdPlace = await apiClient(endpoint, {
    method: "POST",
    body: JSON.stringify(buildPlaceBody(payload, isPrivate)),
  });

  return formatPlace({ ...payload, ...createdPlace }, isPrivate);
}

export async function updatePlace(placeId, payload) {
  const isPrivate = payload.visibility === "private" || payload.source === "user";
  const primaryEndpoint = isPrivate ? `/api/places/private/${placeId}` : `/api/admin/places/${placeId}`;
  const secondaryEndpoint = isPrivate ? `/api/admin/places/${placeId}` : `/api/places/private/${placeId}`;

  try {
    const updatedPlace = await apiClient(primaryEndpoint, {
      method: "PUT",
      body: JSON.stringify(buildPlaceBody(payload, isPrivate)),
    });

    return formatPlace({ ...payload, ...updatedPlace }, isPrivate);
  } catch {
    const updatedPlace = await apiClient(secondaryEndpoint, {
      method: "PUT",
      body: JSON.stringify(buildPlaceBody(payload, !isPrivate)),
    });

    return formatPlace({ ...payload, ...updatedPlace }, !isPrivate);
  }
}

export async function deletePlace(placeId, payload = {}) {
  const isPrivate = payload.visibility === "private" || payload.source === "user";
  const primaryEndpoint = isPrivate ? `/api/places/private/${placeId}` : `/api/admin/places/${placeId}`;
  const secondaryEndpoint = isPrivate ? `/api/admin/places/${placeId}` : `/api/places/private/${placeId}`;

  try {
    await apiClient(primaryEndpoint, { method: "DELETE" });
  } catch {
    await apiClient(secondaryEndpoint, { method: "DELETE" });
  }
}

export async function getExploreRecommendations(tagIds = []) {
  if (!tagIds || tagIds.length === 0) return getPlaces();

  try {
    const query = tagIds.map((id) => `tagIds=${id}`).join("&");
    const places = await apiClient(`/api/recommendations/explore?${query}`);
    return Array.isArray(places) ? places.map((place) => formatPlace(place, false)) : [];
  } catch {
    return mockPlaces;
  }
}
