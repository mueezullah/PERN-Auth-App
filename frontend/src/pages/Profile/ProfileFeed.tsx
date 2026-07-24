import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, User, Heart, MessageCircle, Share2, Clock } from "lucide-react";
import { clsx } from "clsx";
import { formatRelativeTime } from "../../utils";
import { CreateThreadModal } from "../Feed/components/CreateThreadModal";
import { useLike } from "../../features/likes/useLike";

function ProfileLikeButton({
  type,
  id,
  initialLikes = 0,
}: {
  type: "post" | "campaign";
  id: number;
  initialLikes: number;
}) {
  const { liked, likesCount, loading, toggleLike } = useLike(type, id);
  const displayCount = loading ? initialLikes : likesCount;

  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        toggleLike();
      }}
      className={`inline-flex items-center gap-2 text-sm transition-colors cursor-pointer ${liked ? "text-rose-500 font-semibold" : "text-slate-500 hover:text-slate-900"
        }`}
    >
      <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
      <span>{displayCount}</span>
    </span>
  );
}

const sectionData = [
  { key: "Posts", title: "Posts" },
  { key: "Campaigns", title: "Campaigns" },
  { key: "Donations", title: "Donations" },
  { key: "Saved", title: "Saved" },
  { key: "About", title: "About" },
];

const POSTS_PAGE_SIZE = 4;
const CAMPAIGNS_PAGE_SIZE = 3;

const getPaginationPage = (pagination: { page?: number; currentPage?: number } | null) =>
  pagination?.page ?? pagination?.currentPage ?? 1;

const hasMorePages = (pagination: { page?: number; currentPage?: number; totalPages?: number } | null) => {
  if (!pagination?.totalPages) {
    return false;
  }
  return getPaginationPage(pagination) < pagination.totalPages;
};

export function ProfileFeed({
  name,
  username,
  isOwnProfile = true,
}: {
  name?: string;
  username?: string;
  isOwnProfile?: boolean;
}) {
  const navigate = useNavigate();
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
  const [isThreadModalOpen, setIsThreadModalOpen] = useState(false);
  const displayName = name || username || "User";
  const avatar = isOwnProfile ? localStorage.getItem("avatar") : null;
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
            `${import.meta.env.VITE_BASE_API_URL}/posts/user/${nextUserId}?page=1&limit=${POSTS_PAGE_SIZE}`,
          ),
          fetch(
            `${import.meta.env.VITE_BASE_API_URL}/campaigns/user/${nextUserId}?page=1&limit=${CAMPAIGNS_PAGE_SIZE}`,
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

    if (!hasMorePages(currentPagination)) {
      return;
    }

    setLoadingMore(true);

    try {
      const nextPage = getPaginationPage(currentPagination) + 1;
      const pageSize =
        activeTab === "Posts" ? POSTS_PAGE_SIZE : CAMPAIGNS_PAGE_SIZE;
      const endpoint =
        activeTab === "Posts"
          ? `${import.meta.env.VITE_BASE_API_URL}/posts/user/${userId}?page=${nextPage}&limit=${pageSize}`
          : `${import.meta.env.VITE_BASE_API_URL}/campaigns/user/${userId}?page=${nextPage}&limit=${pageSize}`;

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
      ? hasMorePages(postsPagination)
      : hasMorePages(campaignsPagination);

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
          rootMargin: "200px",
          threshold: 0.1,
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

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  const getCampaignProgress = (item: any) => {
    const raised =
      Number(
        item.current_amount ?? item.raised_amount ?? item.amount_raised ?? 0,
      ) || 0;
    const goal = Number(item.goal_amount ?? item.goal ?? 0) || 0;
    const progress = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
    const deadline = item.deadline ? new Date(item.deadline) : null;
    const now = new Date();
    const daysLeft = deadline
      ? Math.max(
        0,
        Math.ceil(
          (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        ),
      )
      : null;
    const statusLabel =
      item.status === "completed" || raised >= goal
        ? "Fully funded"
        : "Funding";

    return { raised, goal, progress, daysLeft, statusLabel };
  };

  const role = localStorage.getItem("role");

  const handleCampaignClick = () => {
    if (role === "admin" || role === "fundraiser") {
      navigate("/create-campaign", { state: { returnTo: location.pathname } });
    } else {
      navigate(`/kyc-verification`, { state: { returnTo: location.pathname } });
    }
  };

  const renderGridItem = (item: any, type: string) => {
    if (type === "Posts") {
      return (
        <div
          onClick={() => navigate(`/posts/${item.id}`)}
          className="cursor-pointer rounded-3xl px-4 py-4 transition-colors hover:bg-slate-100"
        >
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
            <ProfileLikeButton
              type="post"
              id={item.id}
              initialLikes={item.likes_count ?? item.likes ?? 0}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/posts/${item.id}`);
              }}
              className="flex items-center gap-2 text-sm hover:text-slate-900 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{item.comments_count ?? item.comments ?? 0}</span>
            </button>
            <button className="flex items-center gap-2 text-sm hover:text-slate-900 transition-colors">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      );
    }

    const { raised, goal, progress, daysLeft, statusLabel } =
      getCampaignProgress(item);

    return (
      <div
        onClick={() => navigate(`/campaigns/${item.id}`)}
        className="cursor-pointer rounded-3xl px-4 py-4 transition-colors hover:bg-slate-100"
      >
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
              <div className="mt-1 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Campaign
              </div>
            </div>
          </div>
          <div className="space-y-2 text-slate-900">
            <h3 className="text-base font-semibold leading-7">
              {item.title || "Untitled campaign"}
            </h3>
            {item.description && (
              <p className="text-base leading-7">{item.description}</p>
            )}
            {item.media_url && (
              <img
                src={item.media_url}
                alt="Campaign"
                className="w-full rounded-2xl object-cover"
              />
            )}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-3">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Funding progress
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {formatCurrency(raised)} raised
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {Math.round(progress)}%
                  </p>
                  <p className="text-xs text-slate-500">
                    of {formatCurrency(goal)}
                  </p>
                </div>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-linear-to-r from-emerald-500 to-cyan-500 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {daysLeft !== null
                    ? daysLeft === 0
                      ? "Deadline reached"
                      : `${daysLeft} days left`
                    : "No deadline"}
                </span>
                <span className="font-medium text-slate-700">
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-start gap-4 pt-3 text-slate-500">
          <ProfileLikeButton
            type="campaign"
            id={item.id}
            initialLikes={item.likes_count ?? item.likes ?? 0}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/campaigns/${item.id}`);
            }}
            className="flex items-center gap-2 text-sm hover:text-slate-900 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{item.comments_count ?? item.comments ?? 0}</span>
          </button>
          <button className="flex items-center gap-2 text-sm hover:text-slate-900 transition-colors">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-175 mx-auto py-8 flex flex-col">
      <div className="flex items-center space-x-4 mb-6 px-4">
        <div className="relative">
          <button className="hover:ring-2 hover:ring-indigo-500/30 transition-all overflow-hidden rounded-full border border-slate-200 block shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={displayName || "Profile"}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-cover rounded-full cursor-pointer"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 sm:h-16 sm:w-16 md:h-20 md:w-20">
                <User className="h-8 w-8 text-slate-500 sm:h-10 sm:w-10" />
              </div>
            )}
          </button>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
            {displayName}
          </h1>
          {username && (
            <p className="text-md font-bold text-slate-800 mt-1">@{username}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2 px-4 mb-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {sectionData.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              "px-4 py-2 cursor-pointer rounded-full text-[14px] font-semibold transition-colors whitespace-nowrap",
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
        {isOwnProfile && (activeTab === "Posts" || activeTab === "Campaigns") && (
          <button
            onClick={() =>
              activeTab === "Posts"
                ? setIsThreadModalOpen(true)
                : handleCampaignClick()
            }
            className="flex items-center space-x-1.5 px-4 py-2 rounded-full border border-slate-300 cursor-pointer hover:bg-slate-200 transition-colors"
          >
            <Plus className="w-4 h-4 text-slate-700" />
            <span className="text-[14px] font-semibold text-slate-700">
              {activeTab === "Posts" ? "Create Post" :
                "Create Campaign"}
            </span>
          </button>
        )}
        <button className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600"></button>
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

      {/* Thread Modal for creating new posts — only on own profile */}
      {isOwnProfile && (
        <CreateThreadModal
          isOpen={isThreadModalOpen}
          onClose={() => setIsThreadModalOpen(false)}
          onSuccess={(newPost: any) => {
            setIsThreadModalOpen(false);
            // Prepend the new post to the posts list
            setPosts((prevPosts) => [
              {
                ...newPost,
                created_at:
                  newPost?.created_at ||
                  newPost?.createdAt ||
                  new Date().toISOString(),
                author_name: localStorage.getItem("name"),
                author_role: localStorage.getItem("role"),
              },
              ...prevPosts,
            ]);
          }}
        />
      )}
    </div>
  );
}
