const API_BASE_URL =
  typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_PUBLIC_API_BASE_URL !== undefined
    ? import.meta.env.VITE_PUBLIC_API_BASE_URL
    : "";

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
    const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;
    response = await tryFetch(url);
  } catch (error) {
    if (API_BASE_URL) {
      try {
        response = await tryFetch(path);
      } catch {
        if ("fallback" in options) return options.fallback;
        throw new Error("현재 서버에 연결할 수 없습니다.");
      }
    } else {
      if ("fallback" in options) return options.fallback;
      throw new Error("현재 서버에 연결할 수 없습니다.");
    }
  }

    if (!response.ok) {
    if ("fallback" in options) return options.fallback;
    let errorMsg = `요청에 실패했습니다 (${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.message) {
        errorMsg = errorData.message;
      }
    } catch (e) {}
    throw new Error(errorMsg);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : undefined;
}
