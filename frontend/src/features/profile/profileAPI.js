const API_BASE = `${import.meta.env.VITE_BASE_API_URL}/users`;

export const fetchUserProfileStats = async (username) => {
  const res = await fetch(`${API_BASE}/${username}`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch profile stats");
  }
  return data.data;
};
