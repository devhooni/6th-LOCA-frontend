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

const USER_CREATED_PLACES_KEY = "loca:user-created-places";

function readUserCreatedPlaces() {
  if (typeof window === "undefined" || !window.localStorage) return [];

  try {
    const rawPlaces = window.localStorage.getItem(USER_CREATED_PLACES_KEY);
    const parsedPlaces = rawPlaces ? JSON.parse(rawPlaces) : [];
    return Array.isArray(parsedPlaces) ? parsedPlaces.map((place) => formatPlace(place, true)) : [];
  } catch {
    return [];
  }
}

function writeUserCreatedPlace(place) {
  if (typeof window === "undefined" || !window.localStorage || !place) return;

  const formattedPlace = formatPlace({ ...place, createdByUser: true }, place.visibility === "private");
  const currentPlaces = readUserCreatedPlaces();
  const nextPlaces = [
    formattedPlace,
    ...currentPlaces.filter((item) => String(item.id) !== String(formattedPlace.id)),
  ];

  window.localStorage.setItem(USER_CREATED_PLACES_KEY, JSON.stringify(nextPlaces));
}

export function getUserCreatedPlaces() {
  return readUserCreatedPlaces();
}

function getFallbackPlaces() {
  const userCreatedPlaces = getUserCreatedPlaces();
  return [
    ...userCreatedPlaces,
    ...mockPlaces.filter((place) => !userCreatedPlaces.some((item) => String(item.id) === String(place.id))),
  ];
}

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
  const fallbackPlaces = getFallbackPlaces();

  try {
    const [publicData, privateData] = await Promise.all([
      apiClient("/api/places/public", { fallback: mockPlaces.filter((p) => p.visibility !== "private") }),
      apiClient("/api/places/private", { fallback: mockPlaces.filter((p) => p.visibility === "private") }),
    ]);

    const formattedPublic = Array.isArray(publicData) ? publicData.map((p) => formatPlace(p, false)) : [];
    const formattedPrivate = Array.isArray(privateData) ? privateData.map((p) => formatPlace(p, true)) : [];
    const combined = [...getUserCreatedPlaces(), ...formattedPublic, ...formattedPrivate];

    return combined;
  } catch {
    return fallbackPlaces;
  }
}

export async function getPublicPlaces() {
  try {
    const data = await apiClient("/api/places/public");
    return Array.isArray(data) ? data.map((p) => formatPlace(p, false)) : [];
  } catch {
    return mockPlaces.filter((p) => p.visibility !== "private");
  }
}

export async function getPrivatePlaces() {
  const userCreatedPlaces = getUserCreatedPlaces();

  try {
    const data = await apiClient("/api/places/private", {
      fallback: mockPlaces.filter((p) => p.visibility === "private"),
    });
    const privatePlaces = Array.isArray(data) ? data.map((p) => formatPlace(p, true)) : [];
    return [...userCreatedPlaces, ...privatePlaces];
  } catch {
    return [...userCreatedPlaces, ...mockPlaces.filter((p) => p.visibility === "private")];
  }
}

export async function getPlaceById(placeId) {
  const fallbackPlaces = getFallbackPlaces();

  try {
    const isNum = !isNaN(Number(placeId));
    if (isNum) {
      try {
        const publicRes = await apiClient(`/api/places/public/${placeId}`);
        if (publicRes) return formatPlace(publicRes, false);
      } catch {}

      try {
        const privateRes = await apiClient(`/api/places/private/${placeId}`);
        if (privateRes) return formatPlace(privateRes, true);
      } catch {}
    }
    const fallback = fallbackPlaces.find((p) => String(p.id) === String(placeId)) ?? fallbackPlaces[0];
    return fallback;
  } catch {
    return fallbackPlaces.find((p) => String(p.id) === String(placeId)) ?? fallbackPlaces[0];
  }
}

export async function getPublicPlaceById(placeId) {
  const fallbackPlaces = getFallbackPlaces();

  try {
    const isNum = !isNaN(Number(placeId));
    if (isNum) {
      const publicRes = await apiClient(`/api/places/public/${placeId}`);
      if (publicRes) return formatPlace(publicRes, false);
    }
    return getPlaceById(placeId);
  } catch {
    return fallbackPlaces.find((p) => String(p.id) === String(placeId)) ?? fallbackPlaces[0];
  }
}

export async function getPlaceReviews(placeId) {
  try {
    const userReviews = await apiClient("/api/users/me/reviews");
    if (Array.isArray(userReviews)) {
      return userReviews
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
    }
    return mockReviews.filter((review) => String(review.placeId) === String(placeId));
  } catch {
    return mockReviews.filter((review) => String(review.placeId) === String(placeId));
  }
}

export async function createPlace(payload) {
  const isPrivate = payload.visibility === "private";
  const endpoint = isPrivate ? "/api/places/private" : "/api/admin/places";
  const localId = `local-place-${Date.now()}`;
  const fallbackPlace = formatPlace(
    {
      ...payload,
      id: localId,
      placeId: localId,
      createdByUser: true,
      visitCount: 0,
      reviewCount: 0,
    },
    isPrivate,
  );

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
    fallback: fallbackPlace,
  });

  const createdPlace = formatPlace({ ...payload, ...res, createdByUser: true }, isPrivate);
  writeUserCreatedPlace(createdPlace);
  return createdPlace;
}

export async function updatePlace(placeId, payload) {
  const body = {
    name: payload.name,
    address: payload.address || "서울 마포구",
    lat: Number(payload.lat) || 37.5563,
    lng: Number(payload.lng) || 126.9236,
  };

  const isPrivate = payload.visibility === "private" || payload.source === "user";
  const primaryEndpoint = isPrivate ? `/api/places/private/${placeId}` : `/api/admin/places/${placeId}`;
  const secondaryEndpoint = isPrivate ? `/api/admin/places/${placeId}` : `/api/places/private/${placeId}`;

  try {
    const res = await apiClient(primaryEndpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return formatPlace({ ...payload, ...res }, isPrivate);
  } catch {
    const res = await apiClient(secondaryEndpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return formatPlace({ ...payload, ...res }, !isPrivate);
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
    const data = await apiClient(`/api/recommendations/explore?${query}`);
    return Array.isArray(data) ? data.map((p) => formatPlace(p, false)) : [];
  } catch {
    return mockPlaces;
  }
}

