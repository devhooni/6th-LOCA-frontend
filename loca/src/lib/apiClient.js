const API_BASE_URL =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env.VITE_PUBLIC_API_BASE_URL || ""
    : "";
const IS_DEV =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env.DEV
    : false;

function buildApiUrl(path) {
  if (IS_DEV) return path;
  if (!API_BASE_URL) return path;
  return `${API_BASE_URL.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

export async function apiClient(path, options = {}) {
  const { fallback, ...fetchOptions } = options;
  let response;

  const tryFetch = async (targetUrl) => {
    return await fetch(targetUrl, {
      ...fetchOptions,
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
    });
  };

  try {
    const url = buildApiUrl(path);
    response = await tryFetch(url);
  } catch (error) {
    try {
      response = await tryFetch(path);
    } catch {
      if ("fallback" in options) return options.fallback;
      throw new Error("현재 서버에 연결할 수 없습니다.");
    }
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




