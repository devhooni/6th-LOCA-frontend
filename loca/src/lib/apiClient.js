const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_PUBLIC_API_BASE_URL) ||
  "https://sixth-loca-backend-3-12qz.onrender.com";

export async function apiClient(path, options = {}) {
  if (!API_BASE_URL) {
    if ("fallback" in options) return options.fallback;
    throw new Error("API base URL is not configured.");
  }

  let response;
  const { fallback, ...fetchOptions } = options;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    });
  } catch (error) {
    if ("fallback" in options) return options.fallback;
    throw new Error("현재 서버에 연결할 수 없습니다.");
  }

  if (!response.ok) {
    if ("fallback" in options) return options.fallback;
    const message = response.status === 409 ? "이미 등록된 데이터입니다." : "요청 처리 중 문제가 발생했습니다.";
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined;
  }

  const text = await response.text();
  return text ? JSON.parse(text) : undefined;
}

