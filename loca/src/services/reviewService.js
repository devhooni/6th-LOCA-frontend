import { apiClient } from "@/src/lib/apiClient";
import { mockReviews } from "@/src/mocks/reviews";

export async function getPlaceReviews(placeId) {
  const fallback = mockReviews.filter((review) => review.placeId === placeId);
  const finalFallback = fallback.length > 0 ? fallback : mockReviews.slice(0, 2);

  try {
    return await apiClient(`/api/places/${placeId}/reviews`, {
      fallback: finalFallback,
    });
  } catch {
    return finalFallback;
  }
}

export async function getReviewsMe() {
  try {
    return await apiClient("/api/reviews/me", { fallback: mockReviews });
  } catch {
    return mockReviews;
  }
}

export async function createReview(payload) {
  return apiClient("/api/reviews", {
    method: "POST",
    body: JSON.stringify(payload),
    fallback: {
      id: `review-${Date.now()}`,
      date: new Date().toISOString().split("T")[0].replace(/-/g, "."),
      ...payload,
    },
  });
}
