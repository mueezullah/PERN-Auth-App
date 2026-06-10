const API_BASE = `${import.meta.env.VITE_BASE_API_URL}/posts`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: token }),
  };
};

export const fetchPosts = async (page = 1, limit = 10) => {
  const res = await fetch(`${API_BASE}?page=${page}&limit=${limit}`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch posts");
  }
  return data.data;
};

export const createPost = async (postData) => {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(postData),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to create post");
  }
  return data.data;
};

export const updatePost = async (id, postData) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(postData),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to update post");
  }
  return data.data;
};
