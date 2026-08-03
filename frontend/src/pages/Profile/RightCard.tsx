import React, { useEffect, useState } from "react";
import { Image as ImageIcon, Plus, Edit } from "lucide-react";
import { FollowButton } from "../../components/FollowButton";
import { FollowListModal } from "../../components/FollowListModal";

type ProfileStats = {
  id?: number;
  posts: number;
  campaigns: number;
  backedProjects: number;
  totalContributed: number;
  createdAt?: string;
  role?: string;
};

const formatNameWithRole = (name: string, role?: string) => {
  if (role === "admin") return `Admin, ${name}`;
  if (role === "fundraiser") return `Fundraiser, ${name}`;
  return name;
};

export function ProfileRightSidebar({
  name,
  username,
  userId: propUserId,
  profileStats,
  isOwnProfile = true,
}: {
  name?: string;
  username?: string;
  userId?: number;
  profileStats?: ProfileStats | null;
  isOwnProfile?: boolean;
}) {
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [modalType, setModalType] = useState<"followers" | "following" | null>(null);
  const [resolvedUserId, setResolvedUserId] = useState<number | null>(propUserId || profileStats?.id || null);

  const displayName = isOwnProfile
    ? formatNameWithRole(name || "User", profileStats?.role)
    : (name || "User");
  const posts = profileStats?.posts ?? 0;
  const campaigns = profileStats?.campaigns ?? 0;
  const backedProjects = profileStats?.backedProjects ?? 0;
  const totalContributed = profileStats?.totalContributed ?? 0;
  const memberSince = profileStats?.createdAt
    ? new Date(profileStats.createdAt).toLocaleString("default", {
      month: "long",
      year: "numeric",
    })
    : "-";
  const totalContributedLabel = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(totalContributed);

  // Resolve userId if not directly supplied
  useEffect(() => {
    if (propUserId) {
      setResolvedUserId(propUserId);
    } else if (profileStats?.id) {
      setResolvedUserId(profileStats.id);
    } else if (username) {
      fetch(`${import.meta.env.VITE_BASE_API_URL}/users/${username}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.id) {
            setResolvedUserId(data.data.id);
          }
        })
        .catch((err) => console.error("Error resolving user id:", err));
    }
  }, [propUserId, profileStats, username]);

  // Fetch follow counts
  useEffect(() => {
    if (!resolvedUserId) return;

    async function fetchFollowCounts() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/follows/${resolvedUserId}/status`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        const data = await res.json();
        if (res.ok && data.success) {
          setFollowersCount(data.followersCount || 0);
          setFollowingCount(data.followingCount || 0);
        }
      } catch (err) {
        console.error("Failed to load follow counts in sidebar:", err);
      }
    }

    fetchFollowCounts();
  }, [resolvedUserId]);

  return (
    <div className="w-full py-8 pr-4 flex flex-col space-y-4">
      <div className="bg-white rounded-[20px] shadow-sm border border-slate-200/60 overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-linear-to-b from-[#0F2044] to-[#040B1A] relative">
          {isOwnProfile && (
            <button className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors">
              <ImageIcon className="w-4 h-4 text-slate-800" />
            </button>
          )}
        </div>

        {/* Profile Info Card Content */}
        <div className="p-5 flex flex-col">
          <h2 className="text-[20px] font-bold text-slate-900">
            {displayName}
          </h2>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-3 mb-6 mt-4">
            {isOwnProfile && (
              <button className="flex items-center space-x-2 w-fit bg-slate-100 hover:bg-slate-200/70 text-slate-900 font-semibold text-[14px] px-4 py-1.5 rounded-full transition-colors cursor-pointer">
                <Edit className="w-4 h-4" />
                <span>Update</span>
              </button>
            )}
            {!isOwnProfile && resolvedUserId && (
              <FollowButton
                targetUserId={resolvedUserId}
                onFollowChange={(_, fCount, fgCount) => {
                  setFollowersCount(fCount);
                  setFollowingCount(fgCount);
                }}
              />
            )}
          </div>

          {/* Followers & Following Counts */}
          <div className="flex items-center space-x-4 mb-6">
            <p
              onClick={() => setModalType("following")}
              className="text-[14px] font-bold text-slate-700 hover:underline cursor-pointer transition-colors"
            >
              {followingCount} following
            </p>
            <p
              onClick={() => setModalType("followers")}
              className="text-[14px] font-bold text-slate-700 hover:underline cursor-pointer transition-colors"
            >
              {followersCount} followers
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-6">
            <div>
              <p className="text-[16px] font-bold text-slate-900 leading-tight">
                {posts}
              </p>
              <p className="text-[13px] text-slate-500 font-medium">
                Updated Posts
              </p>
            </div>
            <div>
              <p className="text-[16px] font-bold text-slate-900 leading-tight">
                {campaigns}
              </p>
              <p className="text-[13px] text-slate-500 font-medium">
                Total Campaigns
              </p>
            </div>
            <div>
              <p className="text-[16px] font-bold text-slate-900 leading-tight">
                {backedProjects}
              </p>
              <p className="text-[13px] text-slate-500 font-medium">
                Backed Projects
              </p>
            </div>
            <div>
              <p className="text-[16px] font-bold text-slate-900 leading-tight">
                {totalContributedLabel}
              </p>
              <p className="text-[13px] text-slate-500 font-medium">
                Total Contributed
              </p>
            </div>
          </div>

          {/* Single Stat */}
          <div className="mb-6">
            <p className="text-[16px] font-bold text-slate-900 leading-tight">
              {memberSince}
            </p>
            <p className="text-[13px] text-slate-500 font-medium">
              Member Since
            </p>
          </div>

          <div className="border-t border-slate-200/60 my-2 -mx-5 px-5" />

          {/* Social Links Section */}
          <div className="py-2">
            <h3 className="text-[12px] font-semibold text-slate-500 tracking-wide uppercase mb-3">
              Social Links
            </h3>
            {isOwnProfile && (
              <button className="flex items-center space-x-1.5 w-fit bg-slate-100/80 hover:bg-slate-200/70 text-slate-900 font-semibold text-[14px] px-4 py-2 rounded-full transition-colors">
                <Plus className="w-5 h-5" />
                <span>Add Social Link</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Followers / Following List Modal */}
      {resolvedUserId && modalType && (
        <FollowListModal
          isOpen={Boolean(modalType)}
          type={modalType}
          userId={resolvedUserId}
          onClose={() => setModalType(null)}
        />
      )}
    </div>
  );
}
