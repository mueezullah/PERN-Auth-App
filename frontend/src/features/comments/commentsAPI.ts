const API_BASE = `${import.meta.env.VITE_BASE_API_URL}/comments`;

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: token }),
  };
};

export const fetchComments = async (targetType: string, targetId: string | number, since: string = ""): Promise<any[]> => {
  const url = `${API_BASE}?targetType=${targetType}&targetId=${targetId}${since ? `&since=${since}` : ""}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch comments");
  }
  return data.data;
};

export const postComment = async (targetType: string, targetId: string | number, content: string) => {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ targetType, targetId, content }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to create comment");
  }
  return data.data;
};

export const deleteComment = async (commentId: number) => {
  const res = await fetch(`${API_BASE}/${commentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to delete comment");
  }
  return data;
};
