import { useState, useEffect, useCallback } from "react";
import * as campaignAPI from "./creatorAPI";

/**
 * Hook to fetch paginated campaigns.
 * Returns { campaigns, pagination, loading, error, refetch }
 */
export function useCampaigns(page = 1, limit = 10, status = "all") {
  const [campaigns, setCampaigns] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await campaignAPI.fetchCampaigns(page, limit, status);
      setCampaigns((prev) =>
        page === 1 ? data.campaigns : [...prev, ...data.campaigns]
      );
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit, status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Force refetch from page 1
  const refetch = useCallback(() => {
    setCampaigns([]);
    fetchData();
  }, [fetchData]);

  return { campaigns, pagination, loading, error, refetch };
}

/**
 * Hook for creating a campaign.
 * Returns { create, loading, error }
 */
export function useCreateCampaign() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = async (campaignData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await campaignAPI.createCampaign(campaignData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}
