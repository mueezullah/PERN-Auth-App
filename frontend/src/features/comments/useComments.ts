import { useEffect, useState, useRef, useCallback } from "react";
import * as commentsAPI from "./commentsAPI";

export function useComments(targetType: string, targetId: string | number) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const commentsRef = useRef<any[]>(comments);
  commentsRef.current = comments;

  // Initial load, when page is loaded
  const loadInitialComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await commentsAPI.fetchComments(targetType, targetId);
      setComments(data);
    } catch (err: any) {
      setError(err.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [targetType, targetId]);

  // Poll for new comments since the last comment's creation time
  const pollNewComments = useCallback(async () => {
    const currentList = commentsRef.current;
    let since = "";
    if (currentList.length > 0) {
      // Find the latest non-temporary comment
      const nonTempComments = currentList.filter(c => !String(c.id).startsWith("temp_"));
      if (nonTempComments.length > 0) {
        since = nonTempComments[nonTempComments.length - 1].created_at;
      }
    }

    try {
      const newComments = await commentsAPI.fetchComments(targetType, targetId, since);
      if (newComments && newComments.length > 0) {
        setComments((prev) => {
          // Merge lists and filter out duplicates by ID
          const existingIds = new Set(prev.map(c => c.id));
          const filteredNew = (newComments as any[]).filter(nc => !existingIds.has(nc.id));
          
          if (filteredNew.length === 0) return prev;
          return [...prev, ...filteredNew];
        });
      }
    } catch (err) {
      console.error("Polled comments error:", err);
    }
  }, [targetType, targetId]);

  // Handle visibility changes and active polling intervals
  useEffect(() => {
    loadInitialComments();

    let intervalId: any = null;

    const startPolling = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        pollNewComments();
      }, 15000); // 15 seconds polling interval
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        pollNewComments();
        startPolling();
      }
    };

    // Start polling initially
    startPolling();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadInitialComments, pollNewComments]);

  // Add Comment with optimistic UI updates
  const addComment = useCallback(async (content: string) => {
    const tempId = `temp_${Date.now()}`;
    const name = localStorage.getItem("name") || "Me";
    const username = localStorage.getItem("username") || "me";
    const role = localStorage.getItem("role") || "user";
    const userId = localStorage.getItem("userId");

    const optimisticComment = {
      id: tempId,
      user_id: userId ? parseInt(userId, 10) : 0,
      target_type: targetType,
      target_id: typeof targetId === "string" ? parseInt(targetId, 10) : targetId,
      content,
      created_at: new Date().toISOString(),
      author_name: name,
      author_username: username,
      author_role: role
    };

    // Optimistically update list
    setComments((prev) => [...prev, optimisticComment]);

    try {
      const realComment = await commentsAPI.postComment(targetType, targetId, content);
      
      // Swap optimistic comment with the real response
      setComments((prev) => 
        prev.map(c => c.id === tempId ? realComment : c)
      );
      return realComment;
    } catch (err: any) {
      // Revert optimistic update on failure
      setComments((prev) => prev.filter(c => c.id !== tempId));
      throw err;
    }
  }, [targetType, targetId]);

  // Delete Comment with optimistic UI updates
  const removeComment = useCallback(async (commentId: number) => {
    const originalComments = [...commentsRef.current];

    // Optimistically update list
    setComments((prev) => prev.filter(c => c.id !== commentId));

    try {
      await commentsAPI.deleteComment(commentId);
    } catch (err: any) {
      // Revert optimistic update on failure
      setComments(originalComments);
      throw err;
    }
  }, []);

  // Return it:
  return { comments, loading, error, addComment, removeComment };
}
