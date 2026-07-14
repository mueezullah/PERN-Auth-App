import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { Navbar } from "../Feed/components/Navbar";
import { Sidebar } from "../Feed/components/Sidebar";
import { fetchCampaignById } from "../../features/creator/creatorAPI";
import { formatRelativeTime } from "../../utils";
import { ImageWithFallback } from "../Feed/components/ImageFallback/ImageWithFallback";
import DonationModal from "../../components/DonationModal";
import { CommentSection } from "./CommentSection";

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDonationOpen, setIsDonationOpen] = useState(false);

  useEffect(() => {
    const loadCampaign = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCampaignById(id);
        setCampaign(data);
      } catch (err: any) {
        setError(err.message || "Failed to load campaign details");
      } finally {
        setLoading(false);
      }
    };
    loadCampaign();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">
        <Navbar />
        <main className="flex-1 mt-16 max-w-384 mx-10 w-full grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-0 lg:gap-1 px-0 lg:px-0">
          <div className="hidden lg:block h-[calc(100vh-64px)] overflow-y-auto relative border-r border-slate-200/60">
            <Sidebar />
          </div>
          <div className="bg-transparent border-l h-[calc(100vh-64px)] overflow-y-auto w-full p-8 flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">
        <Navbar />
        <main className="flex-1 mt-16 max-w-384 mx-10 w-full grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-0 lg:gap-1 px-0 lg:px-0">
          <div className="hidden lg:block h-[calc(100vh-64px)] overflow-y-auto relative border-r border-slate-200/60">
            <Sidebar />
          </div>
          <div className="bg-transparent border-l h-[calc(100vh-64px)] overflow-y-auto w-full p-8 text-center flex flex-col justify-center items-center gap-4">
            <p className="text-rose-500 font-bold text-lg">{error || "Campaign not found"}</p>
            <button
              onClick={() => navigate("/feed")}
              className="px-6 py-2 bg-slate-900 text-white rounded-full font-bold text-sm"
            >
              Back to Feed
            </button>
          </div>
        </main>
      </div>
    );
  }

  const currentUserId = localStorage.getItem("userId");
  const isOwner = !!(currentUserId && campaign.user_id && String(campaign.user_id) === String(currentUserId));
  
  const raised = parseFloat(campaign.current_amount) || 0;
  const goal = parseFloat(campaign.goal_amount) || 0;
  const progress = Math.min((raised / goal) * 100, 100);
  const now = new Date();

  const daysLeft = campaign.deadline
    ? Math.max(0, Math.ceil((new Date(campaign.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  const isCampaignEnded = campaign.deadline ? new Date(campaign.deadline) < now : false;
  const isCampaignCompleted = campaign.status === "completed" || raised >= goal;
  const isDonateDisabled = isCampaignEnded || isCampaignCompleted;

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">
      <Navbar />
      <main className="flex-1 mt-16 max-w-384 mx-10 w-full grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-0 lg:gap-1 px-0 lg:px-0">
        <div className="hidden lg:block h-[calc(100vh-64px)] overflow-y-auto relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full transition-colors">
          <Sidebar />
        </div>
        <div className="bg-transparent border-l h-[calc(100vh-64px)] overflow-y-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-5 sm:p-8">
          <div className="w-full max-w-220 mx-auto space-y-6">
            
            {/* Header Back Link */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm cursor-pointer select-none mb-2"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            {/* Campaign details card */}
            <article className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 sm:p-8 text-left">
              
              {/* Creator details */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-lg border border-slate-100 shadow-sm">
                  {campaign.owner_name ? campaign.owner_name.charAt(0).toUpperCase() : "C"}
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-bold text-[16px] text-slate-900">
                      {campaign.owner_name}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
                      Campaign
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-500 font-medium">
                    {campaign.owner_username ? `@${campaign.owner_username}` : "Fundraiser"} • {formatRelativeTime(campaign.created_at)}
                  </p>
                </div>
              </div>

              {/* Title & Description */}
              <div className="mb-6">
                <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 mb-4 leading-tight tracking-tight">
                  {campaign.title}
                </h1>
                <p className="text-slate-600 leading-relaxed text-[15px] sm:text-[16px] whitespace-pre-wrap">
                  {campaign.description}
                </p>
              </div>

              {/* Campaign media */}
              {campaign.media_url && (
                <div className="mb-6 rounded-2xl overflow-hidden shadow-xs border border-slate-200/60 bg-slate-50">
                  <ImageWithFallback
                    src={campaign.media_url}
                    alt={campaign.title}
                    className="w-full h-80 sm:h-96 object-cover"
                  />
                </div>
              )}

              {/* Progress details */}
              <div className="mb-6 bg-slate-50/80 rounded-2xl p-5 border border-slate-200/60">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      ${raised.toLocaleString()}
                    </span>
                    <span className="text-slate-500 ml-2 font-medium text-[13px] sm:text-sm">
                      raised of ${goal.toLocaleString()} goal
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {daysLeft !== null && (
                      <span className="flex items-center text-[13px] sm:text-sm font-semibold text-slate-600">
                        <Clock className="w-4 h-4 mr-1 text-slate-400" />
                        {daysLeft === 0 ? "Ended" : `${daysLeft}d left`}
                      </span>
                    )}
                    <span className="text-[13px] sm:text-sm font-bold text-indigo-600">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-linear-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center border-t border-slate-100 pt-5">
                <div></div>
                {isOwner ? (
                  <button
                    onClick={() => navigate("/creator/dashboard")}
                    className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-[14px] rounded-full hover:bg-indigo-700 active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    View Analytics
                  </button>
                ) : isDonateDisabled ? (
                  <span
                    className={`px-6 py-2.5 font-extrabold text-[14px] rounded-full border select-none inline-flex items-center justify-center ${
                      isCampaignCompleted
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {isCampaignCompleted ? "Complete" : "Ended"}
                  </span>
                ) : (
                  <button
                    onClick={() => setIsDonationOpen(true)}
                    className="px-6 py-2.5 bg-slate-900 text-white hover:bg-slate-800 font-bold text-[14px] rounded-full active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    Donate Now
                  </button>
                )}
              </div>
            </article>

            {/* Comments Section */}
            {id && (
              <CommentSection targetType="campaign" targetId={id} />
            )}

            <DonationModal
              isOpen={isDonationOpen}
              onClose={() => setIsDonationOpen(false)}
              // campaign.id
              campaignId={parseInt(campaign.id)}
              goal={goal}
              raised={raised}
            />

          </div>
        </div>
      </main>
    </div>
  );
}
