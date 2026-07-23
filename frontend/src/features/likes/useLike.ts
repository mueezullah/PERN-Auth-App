import { useState, useEffect, useCallback } from "react";
import * as likesAPI from "./likesAPI";

export function useLike(targetType: string, targetId: number) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch initial like status on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await likesAPI.fetchLikeStatus(targetType, targetId);
        if (!cancelled) {
          setLiked(data.liked);
          setLikesCount(data.likesCount);
        }
      } catch (err) {
        console.error("Failed to load like status:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [targetType, targetId]);

  // Toggle like with optimistic update
  const toggleLike = useCallback(async () => {
    const prevLiked = liked;
    const prevCount = likesCount;

    // Optimistic update
    setLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const data = await likesAPI.toggleLike(targetType, targetId);
      setLiked(data.liked);
      setLikesCount(data.likesCount);
    } catch (err) {
      // Revert on failure
      setLiked(prevLiked);
      setLikesCount(prevCount);
      console.error("Failed to toggle like:", err);
    }
  }, [liked, likesCount, targetType, targetId]);

  return { liked, likesCount, loading, toggleLike };
}
