import React, {
  useState,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { FeedCard } from "./FeedCard";
import { CreateThreadModal } from "./CreateThreadModal";
import CreateCampaignModal from "../../../pages/CreatorDashboard/CreateCampaignModal";
import { Sparkles, Edit3, Megaphone } from "lucide-react";
import { useCampaigns } from "../../../features/creator/creatorSlice";
import { usePosts } from '../../../features/Posts/postsSlice';

export function Feed() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [isThreadModalOpen, setIsThreadModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<any | null>(null);
  const { campaigns, pagination, loading, error, refetch: refetchCampaigns } = useCampaigns(page, 10, "all");

  const { posts, loading: postsLoading, error: postsError, prependPost, refetch: refetchPosts } = usePosts(page, 10);

  const role = localStorage.getItem("role");

  const handleCampaignClick = () => {
    if (role === "fundraiser" || role === "admin") {
      navigate("/create-campaign");
    } else {
      navigate("/kyc-verification");
    }
  };

  const handlePostClick = () => {
    setIsThreadModalOpen(true);
  };

  const handleEdit = useCallback((cardData: any) => {
    setEditingCard(cardData);
  }, []);

  const handleEditSuccess = useCallback(() => {
    setEditingCard(null);
    // Refetch both feeds to reflect the updated content
    refetchCampaigns?.();
    refetchPosts?.();
  }, [refetchCampaigns, refetchPosts]);

  const observer = useRef<IntersectionObserver | null>(null);
  const hasMore = pagination ? (pagination as any).currentPage < (pagination as any).totalPages : true;

  const lastPostElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore],
  );

  // Transform backend campaign data to FeedCard props format
  // Note: store raw `createdAt` ISO string for sorting; `user.time` is display-only
  const mapCampaignToPost = (campaign: any) => ({
    id: `campaign-${campaign.id}`,
    type: "campaign" as const,
    createdAt: campaign.created_at,
    user: {
      id: campaign.user_id,
      name: campaign.owner_name || "Anonymous",
      avatar: "",
      role: "Fundraiser",
      time: getTimeAgo(campaign.created_at),
    },
    content: {
      title: campaign.title,
      description: campaign.description,
      image: campaign.media_url || undefined,
    },
    stats: {
      likes: 0,
      comments: 0,
      raised: parseFloat(campaign.current_amount) || 0,
      goal: parseFloat(campaign.goal_amount) || 0,
    },
    deadline: campaign.deadline,
    campaignStatus: campaign.status,
  });

  const mapThreadToPost = (thread: any) => ({
    id: `post-${thread.id}`,
    type: "thread" as const,
    createdAt: thread.created_at,
    user: {
      id: thread.user_id,
      name: thread.author_name || "Anonymous",
      avatar: "",
      role: thread.author_role || "user",
      time: getTimeAgo(thread.created_at),
    },
    content: {
      title: undefined,
      description: thread.content,
      image: thread.media_url || thread.image_url || undefined,
    },
    stats: {
      likes: thread.likes_count || 0,
      comments: thread.comments_count || 0,
    },
  });

  // Sort by raw ISO date — newest first (latest on top)
  const combinedFeed = [
    ...campaigns.map(mapCampaignToPost),
    ...posts.map(mapThreadToPost),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="w-full max-w-[800px] mx-auto min-h-screen py-8 pr-4 pl-4 sm:pl-4 sm:pr-4">
      {/* Create Post / Thread Area */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-5 mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {localStorage.getItem("loggedInUser")?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <button
            onClick={handlePostClick}
            className="flex-1 text-left text-slate-400 font-medium text-[15px] hover:text-slate-600 transition-colors"
          >
            What's on your mind, {localStorage.getItem("loggedInUser") || "there"}?
          </button>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center space-x-1">
            {/* Post / Thread button */}
            <button
              onClick={handlePostClick}
              className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span className="text-[13px] font-semibold">Post Something</span>
            </button>

            {/* Campaign button — role-aware */}
            <button
              onClick={handleCampaignClick}
              className="flex items-center space-x-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-colors"
            >
              <Megaphone className="w-4 h-4" />
              <span className="text-[13px] font-semibold">Raise Campaign</span>
            </button>
          </div>

          <button
            onClick={handlePostClick}
            className="px-5 py-1.5 cursor-pointer bg-slate-900 text-white text-[13px] font-bold rounded-full hover:bg-slate-800 transition-colors"
          >
            Post
          </button>
        </div>
      </div>

      {/* Thread Modal */}
      <CreateThreadModal
        isOpen={isThreadModalOpen}
        onClose={() => setIsThreadModalOpen(false)}
        onSuccess={(newPost: any) => {
          // Prepend the raw post data (augmented with user info from localStorage)
          // so mapThreadToPost can transform it correctly alongside fetched posts
          prependPost({
            ...newPost,
            author_name: localStorage.getItem("loggedInUser") || "Unknown",
            author_role: localStorage.getItem("role") || "user",
          });
        }}
      />

      {/* Edit Post — reuse CreateThreadModal in edit mode */}
      {editingCard && (editingCard.type === "post" || editingCard.type === "thread") && (
        <CreateThreadModal
          isOpen={true}
          onClose={() => setEditingCard(null)}
          editMode={true}
          editPostId={editingCard.id.replace("post-", "")}
          initialContent={editingCard.content.description}
          initialImage={editingCard.content.image}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Edit Campaign — reuse CreateCampaignModal in edit mode */}
      {editingCard && editingCard.type === "campaign" && (
        <CreateCampaignModal
          editMode={true}
          editCampaignId={editingCard.id.replace("campaign-", "")}
          initialData={{
            title: editingCard.content.title || "",
            description: editingCard.content.description,
            goal_amount: editingCard.stats.goal || 0,
            deadline: editingCard.deadline || "",
            media_url: editingCard.content.image || "",
          }}
          onClose={() => setEditingCard(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Error State */}
      {(error || postsError) && !loading && !postsLoading && combinedFeed.length === 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-red-200/60 p-8 mb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Something went wrong</h3>
          <p className="text-slate-500 text-[15px] mb-4">{error || postsError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-slate-900 text-white text-[13px] font-bold rounded-full hover:bg-slate-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !postsLoading && !error && !postsError && combinedFeed.length === 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-10 mb-8 text-center">
          <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-full flex items-center justify-center border border-indigo-100">
            <Megaphone className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Nothing here yet</h3>
          <p className="text-slate-500 text-[15px] mb-6 max-w-md mx-auto">
            Be the first to share something! Post a thread or start a campaign.
          </p>
          {(localStorage.getItem("role") === "fundraiser" || localStorage.getItem("role") === "admin") && (
            <a
              href="/create-campaign"
              className="inline-flex items-center px-6 py-2.5 bg-slate-900 text-white text-[14px] font-bold rounded-full hover:bg-slate-800 transition-colors shadow-sm"
            >
              <Megaphone className="w-4 h-4 mr-2" />
              Create Your First Campaign
            </a>
          )}
        </div>
      )}

      {/* Feed Posts */}
      {combinedFeed.map((post: any, index: number) => {
        if (combinedFeed.length === index + 1) {
          return (
            <div ref={lastPostElementRef} key={post.id}>
              <FeedCard {...post} onEdit={handleEdit} />
            </div>
          );
        } else {
          return <FeedCard key={post.id} {...post} onEdit={handleEdit} />;
        }
      })}

      {/* Loading Skeletons */}
      {loading && (
        <div className="space-y-6 animate-pulse">
          {[1, 2].map((i) => (
            <div
              key={`skeleton-${i}`}
              className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6"
            >
              <div className="flex items-center space-x-3 mb-5">
                <div className="w-12 h-12 rounded-full bg-slate-100"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-100 rounded-md w-1/4"></div>
                  <div className="h-3 bg-slate-100 rounded-md w-1/5"></div>
                </div>
              </div>
              <div className="space-y-3 mb-5">
                <div className="h-5 bg-slate-100 rounded-md w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded-md w-full"></div>
                <div className="h-4 bg-slate-100 rounded-md w-5/6"></div>
              </div>
              <div className="h-64 bg-slate-100 rounded-2xl mb-4"></div>
            </div>
          ))}
        </div>
      )}

      {!hasMore && combinedFeed.length > 0 && (
        <div className="text-center py-8 text-slate-400 font-medium text-[15px]">
          You've caught up on all updates!
        </div>
      )}
    </div>
  );
}

// Utility: relative time display
function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}