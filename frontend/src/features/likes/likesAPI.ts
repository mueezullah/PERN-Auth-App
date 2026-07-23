const API_BASE = `${import.meta.env.VITE_BASE_API_URL}/likes`;

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  const authHeader = token
    ? token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`
    : "";
  return {
    "Content-Type": "application/json",
    ...(authHeader && { Authorization: authHeader }),
  };
};

export const toggleLike = async (targetType: string, targetId: number) => {
  const res = await fetch(`${API_BASE}/toggle`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ targetType, targetId }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to toggle like");
  }
  return data.data as { liked: boolean; likesCount: number };
};

export const fetchLikeStatus = async (targetType: string, targetId: number) => {
  const res = await fetch(
    `${API_BASE}/status?targetType=${targetType}&targetId=${targetId}`,
    { headers: getAuthHeaders() }
  );
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch like status");
  }
  return data.data as { liked: boolean; likesCount: number };
};
