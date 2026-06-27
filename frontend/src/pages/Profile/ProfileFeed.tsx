import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Plus,
  SlidersHorizontal,
  User,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";
import { clsx } from "clsx";
import { formatRelativeTime } from "../../utils";

const sectionData = [
  { key: "Posts", title: "User Posts" },
  { key: "Campaigns", title: "User Campaigns" },
  { key: "Donations", title: "Donations" },
  { key: "Saved", title: "Saved" },
  { key: "About", title: "About" },
];

export function ProfileFeed({
  name,
  username,
}: {
  name?: string;
  username?: string;
}) {
  const [activeTab, setActiveTab] = useState("Posts");
  const [posts, setPosts] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [postsPagination, setPostsPagination] = useState<any | null>(null);
  const [campaignsPagination, setCampaignsPagination] = useState<any | null>(
    null,
  );
  const displayName = name || username || "User";
  const avatar = localStorage.getItem("avatar");
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    async function loadProfileContent() {
      setLoading(true);
      setError(null);
      setPosts([]);
      setCampaigns([]);
      setPostsPagination(null);
      setCampaignsPagination(null);
      setUserId(null);

      try {
        if (!username) {
          throw new Error("Username required");
        }

        const profileRes = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/users/${username}`,
        );
        const profileData = await profileRes.json();
        if (!profileRes.ok || !profileData.success) {
          throw new Error(profileData.message || "Unable to load profile");
        }

        const nextUserId = profileData.data.id;
        setUserId(nextUserId);

        const [postsRes, campaignsRes] = await Promise.all([
          fetch(
            `${import.meta.env.VITE_BASE_API_URL}/posts/user/${nextUserId}?page=1&limit=6`,
          ),
          fetch(
            `${import.meta.env.VITE_BASE_API_URL}/campaigns/user/${nextUserId}?page=1&limit=6`,
          ),
        ]);

        const postsData = await postsRes.json();
        const campaignsData = await campaignsRes.json();

        if (!postsRes.ok || !postsData.success) {
          throw new Error(postsData.message || "Unable to load profile posts");
        }
        if (!campaignsRes.ok || !campaignsData.success) {
          throw new Error(
            campaignsData.message || "Unable to load profile campaigns",
          );
        }

        setPosts(postsData.data.posts || []);
        setCampaigns(campaignsData.data.campaigns || []);
        setPostsPagination(postsData.data.pagination || null);
        setCampaignsPagination(campaignsData.data.pagination || null);
      } catch (err: any) {
        setError(err.message || "Failed to load profile content");
      } finally {
        setLoading(false);
      }
    }

    loadProfileContent();
  }, [username]);

  const loadMoreItems = useCallback(async () => {
    if (loadingMore || !userId || !username) {
      return;
    }

    const currentPagination =
      activeTab === "Posts" ? postsPagination : campaignsPagination;

    if (
      !currentPagination ||
      currentPagination.currentPage >= currentPagination.totalPages
    ) {
      return;
    }

    setLoadingMore(true);

    try {
      const nextPage = currentPagination.currentPage + 1;
      const endpoint =
        activeTab === "Posts"
          ? `${import.meta.env.VITE_BASE_API_URL}/posts/user/${userId}?page=${nextPage}&limit=6`
          : `${import.meta.env.VITE_BASE_API_URL}/campaigns/user/${userId}?page=${nextPage}&limit=6`;

      const res = await fetch(endpoint);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Unable to load more profile content");
      }

      const items =
        activeTab === "Posts"
          ? data.data.posts || []
          : data.data.campaigns || [];

      if (activeTab === "Posts") {
        setPosts((prevPosts) => [...prevPosts, ...items]);
        setPostsPagination(data.data.pagination || null);
      } else {
        setCampaigns((prevCampaigns) => [...prevCampaigns, ...items]);
        setCampaignsPagination(data.data.pagination || null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load more profile content");
    } finally {
      setLoadingMore(false);
    }
  }, [
    activeTab,
    campaignsPagination,
    loadingMore,
    postsPagination,
    userId,
    username,
  ]);

  useEffect(() => {
    return () => {
      observer.current?.disconnect();
    };
  }, []);

  const activeItems =
    activeTab === "Posts" ? posts : activeTab === "Campaigns" ? campaigns : [];
  const hasMoreItems =
    activeTab === "Posts"
      ? postsPagination?.currentPage < postsPagination?.totalPages
      : campaignsPagination?.currentPage < campaignsPagination?.totalPages;

  const lastItemElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || loadingMore || !hasMoreItems) {
        return;
      }

      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            loadMoreItems();
          }
        },
        {
          threshold: 0.25,
        },
      );

      if (node) {
        observer.current.observe(node);
      }
    },
    [hasMoreItems, loadMoreItems, loading, loadingMore],
  );
  const activeTabTitle =
    sectionData.find((item) => item.key === activeTab)?.title || activeTab;

  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  const renderGridItem = (item: any, type: string) => {
    if (type === "Posts") {
      return (
        <div className="rounded-3xl px-4 py-4 transition-colors hover:bg-slate-50">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center text-slate-500 text-sm">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={item.author_name || displayName || "Profile"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-semibold text-slate-700">
                    {getInitials(item.author_name || displayName)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                  <span>{item.author_name || displayName}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">
                    {formatRelativeTime(item.created_at)}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-slate-900">
              {item.content && (
                <p className="text-base leading-7">{item.content}</p>
              )}
              {item.media_url && (
                <img
                  src={item.media_url}
                  alt="Post"
                  className="w-full rounded-2xl object-cover"
                />
              )}
            </div>
          </div>
          <div className="flex items-center justify-start gap-4 pt-3 text-slate-500">
            <button className="flex items-center gap-2 text-sm hover:text-slate-900 transition-colors">
              <Heart className="w-4 h-4" />
              <span>{item.likes ?? 0}</span>
            </button>
            <button className="flex items-center gap-2 text-sm hover:text-slate-900 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>{item.comments ?? 0}</span>
            </button>
            <button className="flex items-center gap-2 text-sm hover:text-slate-900 transition-colors">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        key={`campaign-${item.id}`}
        className="rounded-3xl border border-slate-200/70 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="font-semibold text-slate-900 mb-2 line-clamp-2">
          {item.title || "Untitled campaign"}
        </div>
        <p className="text-sm text-slate-600 line-clamp-3">
          {item.description || "No description available."}
        </p>
        {item.media_url && (
          <img
            src={item.media_url}
            alt="Campaign"
            className="mt-3 w-full h-36 object-cover rounded-2xl"
          />
        )}
        <div className="mt-3 text-xs text-slate-500">
          Goal: ${parseFloat(item.goal_amount || 0).toLocaleString()}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-175 mx-auto py-8 flex flex-col">
      <div className="flex items-center space-x-4 mb-6 px-4">
        <div className="relative">
          <button className="hover:ring-2 hover:ring-indigo-500/30 transition-all overflow-hidden rounded-full border border-slate-200 block">
            {avatar ? (
              <img
                src={avatar}
                alt={displayName || "Profile"}
                className="w-7 h-7 md:w-9 md:h-9 object-cover rounded-full cursor-pointer"
              />
            ) : (
              <User className="w-7 h-7 md:w-9 md:h-9 text-slate-500 bg-slate-100 p-1.5 rounded-full cursor-pointer" />
            )}
          </button>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
            {displayName}
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-2 px-4 mb-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {sectionData.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              "px-4 py-2 rounded-full text-[14px] font-semibold transition-colors whitespace-nowrap",
              activeTab === tab.key
                ? "bg-slate-200/70 text-slate-900"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            {tab.key}
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-3 px-4 pb-4 border-b border-slate-200 mb-6">
        <button className="flex items-center space-x-1.5 px-4 py-2 rounded-full border border-slate-300 hover:bg-slate-50 transition-colors">
          <Plus className="w-4 h-4 text-slate-700" />
          <span className="text-[14px] font-semibold text-slate-700">
            New Campaign
          </span>
        </button>
        <button className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="px-4 py-24 text-center text-slate-500">
          Loading profile activity…
        </div>
      ) : error ? (
        <div className="px-4 py-24 text-center text-rose-500">{error}</div>
      ) : (
        <div className="px-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {activeTabTitle}
              </h2>
            </div>
          </div>

          {activeItems.length === 0 ? (
            <div className="rounded-3xl border border-slate-200/70 bg-white p-12 text-center text-slate-500">
              No {activeTab.toLowerCase()} yet.
            </div>
          ) : (
            <div className="flex flex-col gap-4 pr-2">
              {activeItems.map((item, index) => (
                <div
                  ref={
                    index === activeItems.length - 1 ? lastItemElementRef : null
                  }
                  key={`${activeTab}-${index}`}
                  className="border-b border-slate-200/70 pb-4 last:border-b-0"
                >
                  {renderGridItem(item, activeTab)}
                </div>
              ))}
              {loadingMore && (
                <div className="py-4 text-center text-sm text-slate-500">
                  Loading more...
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
