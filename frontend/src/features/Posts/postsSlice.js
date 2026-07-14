import { useState, useEffect, useCallback } from "react";
import * as postsAPI from "./postsAPI";

export function usePosts(page = 1, limit = 10) {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await postsAPI.fetchPosts(page, limit);
      setPosts((prev) => (page === 1 ? data.posts : [...prev, ...data.posts]));
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);



  // Force a clean refetch from the beginning
  const refetch = useCallback(() => {
    setPosts([]);
    fetchData();
  }, [fetchData]);

  // Optimistic update: prepend a post immediately without waiting for network
  const prependPost = useCallback((newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  }, []);

  return { posts, pagination, loading, error, refetch, prependPost };
}

export function useCreatePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const create = async (postData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await postsAPI.createPost(postData);
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
