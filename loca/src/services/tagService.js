import { apiClient } from "@/src/lib/apiClient";
import { mockTags } from "@/src/mocks/places";

export async function getTags() {
  try {
    const res = await apiClient("/api/tags", { fallback: mockTags });
    if (!Array.isArray(res)) return mockTags;
    return res.map((tag) => ({
      ...tag,
      id: tag.tagId ?? tag.id,
      name: tag.name,
    }));
  } catch {
    return mockTags;
  }
}

export async function createTag(payload) {
  const res = await apiClient("/api/admin/tags", {
    method: "POST",
    body: JSON.stringify({ name: payload.name }),
    fallback: { id: `mock-tag-${Date.now()}`, name: payload.name },
  });
  return {
    ...res,
    id: res.tagId ?? res.id ?? `tag-${Date.now()}`,
    tagId: res.tagId ?? res.id,
    name: res.name,
  };
}

export async function deleteTag(tagId) {
  await apiClient(`/api/admin/tags/${tagId}`, {
    method: "DELETE",
    fallback: undefined,
  });
}

