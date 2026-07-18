const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_PUBLIC_API_BASE_URL) ||
  "http://192.168.164.130:8080";

export async function apiClient(path, options = {}) {
  if (!API_BASE_URL) {
    if ("fallback" in options) return options.fallback;
    throw new Error("API base URL is not configured.");
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    if ("fallback" in options) return options.fallback;
    throw new Error("현재 서버에 연결할 수 없습니다. Mock 데이터로 표시합니다.");
  }

  if (!response.ok) {
    const message = response.status === 409 ? "이미 등록된 데이터입니다." : "요청 처리 중 문제가 발생했습니다.";
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined;
  }

  return response.json();
}
