import { apiClient } from "@/src/lib/apiClient";
import { mockPlaces } from "@/src/mocks/places";
import { mockReviews } from "@/src/mocks/reviews";

export async function getPlaces() {
  try {
    return await apiClient("/api/places", { fallback: mockPlaces });
  } catch {
    return mockPlaces;
  }
}

export async function getPublicPlaces() {
  const fallback = mockPlaces.filter((place) => place.visibility !== "private");
  try {
    return await apiClient("/api/places/public", { fallback });
  } catch {
    return fallback;
  }
}

export async function getPlaceById(placeId) {
  const fallback =
    mockPlaces.find((place) => place.id === placeId) ?? mockPlaces[0];

  try {
    return await apiClient(`/api/places/${placeId}`, { fallback });
  } catch {
    return fallback;
  }
}

export async function getPublicPlaceById(placeId) {
  const fallback =
    mockPlaces.find((place) => place.id === placeId) ?? mockPlaces[0];

  try {
    return await apiClient(`/api/places/public/${placeId}`, { fallback });
  } catch {
    return fallback;
  }
}

export async function getPlaceReviews(placeId) {
  const fallback = mockReviews.filter(
    (review) => review.placeId === placeId
  );
  // placeId에 해당하는 mockReview가 부족한 경우 상위 mockReviews 제공
  const finalFallback = fallback.length > 0 ? fallback : mockReviews.slice(0, 2);

  try {
    return await apiClient(`/api/places/${placeId}/reviews`, {
      fallback: finalFallback,
    });
  } catch {
    return finalFallback;
  }
}

export async function createPlace(payload) {
  return apiClient("/api/admin/places", {
    method: "POST",
    body: JSON.stringify(payload),
    fallback: {
      ...mockPlaces[0],
      ...payload,
      id: `mock-${Date.now()}`,
      visibility: payload.visibility ?? "private",
      source: payload.source ?? "user",
      categoryLabel: payload.category,
      tags: payload.tagIds,
      rating: 0,
      reviewCount: 0,
      distance: "-",
      hours: "-",
    },
  });
}

export async function updatePlace(placeId, payload) {
  const fallback =
    mockPlaces.find((place) => place.id === placeId) ?? mockPlaces[0];

  return apiClient(`/api/admin/places/${placeId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    fallback: { ...fallback, ...payload },
  });
}

export async function deletePlace(placeId) {
  await apiClient(`/api/admin/places/${placeId}`, {
    method: "DELETE",
    fallback: undefined,
  });
}
