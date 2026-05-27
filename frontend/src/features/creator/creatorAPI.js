const API_BASE = `${import.meta.env.VITE_BASE_API_URL}/campaigns`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: token }),
  };
};

export const fetchCampaigns = async (page = 1, limit = 10, status = "all") => {
  const res = await fetch(`${API_BASE}?page=${page}&limit=${limit}&status=${status}`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch campaigns");
  }
  return data.data; // { campaigns, pagination }
};

export const createCampaign = async (campaignData) => {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(campaignData),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to create campaign");
  }
  return data.data;
};

export const fetchCampaignById = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Campaign not found");
  }
  return data.data;
};

export const updateCampaign = async (id, campaignData) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(campaignData),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Failed to update campaign");
  }
  return data.data;
};
