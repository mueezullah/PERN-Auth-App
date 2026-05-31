import React, { useState } from "react";
import {
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Bookmark,
  Clock,
  Trash2,
  Edit2,
  Pin,
  AlertTriangle,
  UserPlus,
  EyeOff,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { handleSuccess, handleError } from "../../../utils";
import { ImageWithFallback } from "./ImageFallback/ImageWithFallback";
import DonationModal from "../../../components/DonationModal";
import { useNavigate } from "react-router-dom";

interface FeedCardProps {
  id: string;
  type?: "campaign" | "post" | "thread";
  user: {
    id?: string | number;
    name: string;
    avatar: string;
    role: string;
    time: string;
  };
  content: {
    title?: string;
    description: string;
    image?: string;
  };
  stats: {
    likes: number;
    comments: number;
    raised?: number;
    goal?: number;
  };
  deadline?: string;
  campaignStatus?: string;
}

export function FeedCard({
  id,
  type = "campaign",
  user,
  content,
  stats,
  deadline,
  campaignStatus,
}: FeedCardProps) {
  const currentUserId = localStorage.getItem("userId");
  const isOwner = !!(currentUserId && user?.id && String(user.id) === String(currentUserId));

  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isCampaign =
    type === "campaign" &&
    stats.raised !== undefined &&
    stats.goal !== undefined;
  const progress = isCampaign
    ? Math.min((stats.raised! / stats.goal!) * 100, 100)
    : 0;

  const [now] = useState(() => new Date());

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Calculate days remaining until deadline
  const daysLeft = deadline
    ? Math.max(
      0,
      Math.ceil(
        (new Date(deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ),
    )
    : null;
  const isCampaignEnded = deadline ? new Date(deadline) < now : false;
  const isCampaignCompleted = campaignStatus === 'completed' || (stats.raised !== undefined && stats.goal !== undefined && stats.raised >= stats.goal);
  const isDonateDisabled = isCampaignEnded || isCampaignCompleted;

  const handleAction = async (actionType: string) => {
    setIsMenuOpen(false); // Close menu instantly
    switch (actionType) {
      case "delete":
        if (window.confirm("Are you sure you want to delete this?")) {
          try {
            // Determine if it is a campaign or a post
            const isCamp = type === "campaign";
            const deleteEndpoint = isCamp
              ? `${import.meta.env.VITE_BASE_API_URL}/campaigns/${id.replace("campaign-", "")}`
              : `${import.meta.env.VITE_BASE_API_URL}/posts/${id.replace("post-", "")}`;

            const response = await fetch(deleteEndpoint, {
              method: "DELETE",
              headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
              }
            });
            const result = await response.json();
            if (result.success) {
              handleSuccess(`${isCamp ? "Campaign" : "Post"} deleted successfully!`);
              // Refresh list or trigger page reload to reflect changes
              window.location.reload();
            } else {
              handleError(result.message || "Failed to delete.");
            }
          } catch (error) {
            console.error("Delete action failed:", error);
            handleError("Network error occurred while deleting.");
          }
        }
        break;

      case "edit":
        handleSuccess("Edit modal or form opened!");
        // TODO: Open an edit modal or redirect to edit page
        break;

      case "pin":
        handleSuccess("Post successfully pinned to your profile!");
        // TODO: Call API endpoint POST /api/users/pin with post ID
        break;

      case "report":
        handleSuccess("Thank you! This content has been reported for review.");
        // TODO: Call API endpoint POST /api/reports with content details
        break;

      case "follow":
        handleSuccess(`You are now following ${user.name}!`);
        // TODO: Call API endpoint POST /api/users/follow with user.id
        break;

      case "not_interested":
        handleSuccess("Content hidden. We will adjust your recommendation feed.");
        // TODO: Temporarily hide this card in local state or update feed model
        break;

      default:
        break;
    }
  };

  return (
    <article className="bg-white rounded-3xl shadow-sm border mb-8 border-slate-200/60 p-5 sm:p-6 transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {user.avatar ? (
            <ImageWithFallback
              src={user.avatar}
              alt={user.name}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border border-slate-100"
            />
          ) : (
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-lg border border-slate-100">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="font-bold text-[15px] sm:text-[16px] text-slate-900 cursor-pointer hover:underline">
                {user.name}
              </h3>
              {isCampaign && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider hidden sm:inline-block">
                  Campaign
                </span>
              )}
            </div>
            <p className="text-[13px] text-slate-500 font-medium">
              {user.role} • {user.time}
            </p>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-full transition-all duration-200 ${isMenuOpen
              ? "text-indigo-600 bg-indigo-50/80 scale-105"
              : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
              }`}
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-100 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-250">
              {isOwner ? (
                // OWNER OPTIONS (Your Post / Campaign)
                <>
                  <button
                    onClick={() => handleAction("delete")}
                    className="flex items-center space-x-2.5 w-full px-4 py-2.5 text-left text-[14px] font-semibold text-rose-600 hover:bg-rose-50/80 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    <span>Delete</span>
                  </button>

                  <button
                    onClick={() => handleAction("edit")}
                    className="flex items-center space-x-2.5 w-full px-4 py-2.5 text-left text-[14px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-slate-400" />
                    <span>Edit Details</span>
                  </button>

                  <button
                    onClick={() => handleAction("pin")}
                    className="flex items-center space-x-2.5 w-full px-4 py-2.5 text-left text-[14px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Pin className="w-4 h-4 text-slate-400" />
                    <span>Pin to profile</span>
                  </button>
                </>
              ) : (
                // NON-OWNER OPTIONS (Other's Post / Campaign)
                <>
                  <button
                    onClick={() => handleAction("report")}
                    className="flex items-center space-x-2.5 w-full px-4 py-2.5 text-left text-[14px] font-semibold text-rose-600 hover:bg-rose-50/80 transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Report Content</span>
                  </button>

                  <button
                    onClick={() => handleAction("follow")}
                    className="flex items-center space-x-2.5 w-full px-4 py-2.5 text-left text-[14px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <UserPlus className="w-4 h-4 text-slate-400" />
                    <span>Follow Owner</span>
                  </button>

                  <button
                    onClick={() => handleAction("not_interested")}
                    className="flex items-center space-x-2.5 w-full px-4 py-2.5 text-left text-[14px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <EyeOff className="w-4 h-4 text-slate-400" />
                    <span>Not interested</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        {content.title && (
          <h2 className="text-[18px] sm:text-xl font-bold text-slate-900 mb-2 leading-snug tracking-tight">
            {content.title}
          </h2>
        )}
        <p className="text-slate-600 leading-relaxed text-[15px] sm:text-[16px] whitespace-pre-wrap line-clamp-4">
          {content.description}
        </p>
      </div>

      {/* Media */}
      {content.image && (
        <div className="mb-5 rounded-2xl overflow-hidden shadow-sm border border-slate-200/60 bg-slate-50">
          <ImageWithFallback
            src={content.image}
            alt="Post visual"
            className="w-full h-64 sm:h-80 object-cover"
          />
        </div>
      )}

      {/* Funding Progress */}
      {isCampaign && (
        <div className="mb-5 bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/60">
          <div className="flex justify-between items-end mb-3">
            <div>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
                ${stats.raised!.toLocaleString()}
              </span>
              <span className="text-slate-500 ml-2 font-medium text-[13px] sm:text-sm">
                raised of ${stats.goal!.toLocaleString()} goal
              </span>
            </div>
            <div className="flex items-center space-x-3">
              {daysLeft !== null && (
                <span className="flex items-center text-[13px] sm:text-sm font-semibold text-slate-600">
                  <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {daysLeft === 0 ? "Ended" : `${daysLeft}d left`}
                </span>
              )}
              <span className="text-[13px] sm:text-sm font-bold text-indigo-600">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 sm:pt-4 mt-2">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button className="flex items-center space-x-2 text-slate-500 hover:text-rose-500 transition-colors group px-2 py-1.5 rounded-full hover:bg-rose-50">
            <Heart className="w-[18px] h-[18px] sm:w-5 sm:h-5 transition-transform group-active:scale-90" />
            <span className="font-semibold text-[13px] sm:text-sm">
              {stats.likes}
            </span>
          </button>
          <button className="flex items-center space-x-2 text-slate-500 hover:text-indigo-500 transition-colors group px-2 py-1.5 rounded-full hover:bg-indigo-50">
            <MessageSquare className="w-[18px] h-[18px] sm:w-5 sm:h-5 transition-transform group-active:scale-90" />
            <span className="font-semibold text-[13px] sm:text-sm">
              {stats.comments}
            </span>
          </button>
          <button className="flex items-center space-x-2 text-slate-500 hover:text-emerald-500 transition-colors group px-2 py-1.5 rounded-full hover:bg-emerald-50">
            <Share2 className="w-[18px] h-[18px] sm:w-5 sm:h-5 transition-transform group-active:scale-90" />
          </button>
          <button className="flex items-center space-x-2 text-slate-500 hover:text-amber-500 transition-colors group px-2 py-1.5 rounded-full hover:bg-amber-50">
            <Bookmark className="w-[18px] h-[18px] sm:w-5 sm:h-5 transition-transform group-active:scale-90" />
          </button>
        </div>

        {isCampaign && !isOwner && (
          isDonateDisabled ? (
            <span
              className={`px-5 py-2 sm:px-6 sm:py-2.5 font-extrabold text-[13px] sm:text-[14px] rounded-full border select-none inline-flex items-center justify-center ${isCampaignCompleted
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
            >
              {isCampaignCompleted ? "complete" : "InComplete"}
            </span>
          ) : (
            <button
              onClick={() => setIsDonationOpen(true)}
              className="px-5 py-2 sm:px-6 sm:py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-bold text-[13px] sm:text-[14px] rounded-full active:scale-95 transition-all shadow-sm"
            >
              Donate Now
            </button>
          )
        )}

        {isCampaign && isOwner && (
          <button
            onClick={() => navigate("/creator/dashboard")}
            className="px-5 py-2 sm:px-6 sm:py-2.5 bg-indigo-600 text-white font-bold text-[13px] sm:text-[14px] rounded-full hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
          >
            View Analytics
          </button>
        )}
      </div>

      <DonationModal
        isOpen={isDonationOpen}
        onClose={() => setIsDonationOpen(false)}
        // Feed passes 'id' as 'campaign-1', so we must extract only the number!
        campaignId={parseInt(id.replace(/\D/g, ""))}
        goal={stats.goal}
        raised={stats.raised}
      />
    </article>
  );
}