import React, { useState } from "react";
import {
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  Bookmark,
  Clock,
} from "lucide-react";
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
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const navigate = useNavigate();

  const isCampaign =
    type === "campaign" &&
    stats.raised !== undefined &&
    stats.goal !== undefined;
  const progress = isCampaign
    ? Math.min((stats.raised! / stats.goal!) * 100, 100)
    : 0;

  const [now] = useState(() => new Date());

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
        <button className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-50 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
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

        {isCampaign &&
          String(user.id) !== String(localStorage.getItem("userId")) && (
            isDonateDisabled ? (
              <span
                className={`px-5 py-2 sm:px-6 sm:py-2.5 font-extrabold text-[13px] sm:text-[14px] rounded-full border select-none inline-flex items-center justify-center ${
                  isCampaignCompleted
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

        {isCampaign &&
          String(user.id) === String(localStorage.getItem("userId")) && (
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