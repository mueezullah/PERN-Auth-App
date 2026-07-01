import { useState, useEffect, useCallback } from "react";
import * as campaignAPI from "./creatorAPI";
import { getPusher } from "../../utils/pusher";

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

  // Real-time listener for campaigns channel
  useEffect(() => {
    const pusher = getPusher();
    if (!pusher) return;

    const channel = pusher.subscribe("campaigns");

    channel.bind("campaign-created", (newCampaign) => {
      setCampaigns((prev) => {
        if (prev.some((c) => c.id === newCampaign.id)) return prev;
        return [newCampaign, ...prev];
      });
    });

    channel.bind("campaign-updated", (updatedCampaign) => {
      setCampaigns((prev) =>
        prev.map((c) => (c.id === updatedCampaign.id ? updatedCampaign : c))
      );
    });

    channel.bind("campaign-deleted", (data) => {
      setCampaigns((prev) => prev.filter((c) => c.id !== data.id));
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe("campaigns");
    };
  }, []);

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
