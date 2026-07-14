import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, MessageSquare, Share2, Bookmark } from "lucide-react";
import { Navbar } from "../Feed/components/Navbar";
import { Sidebar } from "../Feed/components/Sidebar";
import { fetchPostById } from "../../features/Posts/postsAPI";
import { formatRelativeTime } from "../../utils";
import { ImageWithFallback } from "../Feed/components/ImageFallback/ImageWithFallback";
import { CommentSection } from "./CommentSection";

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPost = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPostById(id);
        setPost(data);
      } catch (err: any) {
        setError(err.message || "Failed to load post details");
      } finally {
        setLoading(false);
      }
    };
    loadPost();
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

  if (error || !post) {
    return (
      <div className="h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">
        <Navbar />
        <main className="flex-1 mt-16 max-w-384 mx-10 w-full grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-0 lg:gap-1 px-0 lg:px-0">
          <div className="hidden lg:block h-[calc(100vh-64px)] overflow-y-auto relative border-r border-slate-200/60">
            <Sidebar />
          </div>
          <div className="bg-transparent border-l h-[calc(100vh-64px)] overflow-y-auto w-full p-8 text-center flex flex-col justify-center items-center gap-4">
            <p className="text-rose-500 font-bold text-lg">{error || "Post not found"}</p>
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

            {/* Post details card */}
            <article className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 sm:p-8 text-left">
              
              {/* Author details */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-lg border border-slate-100 shadow-sm">
                  {post.author_name ? post.author_name.charAt(0).toUpperCase() : "U"}
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-bold text-[16px] text-slate-900">
                      {post.author_name}
                    </h3>
                  </div>
                  <p className="text-[13px] text-slate-500 font-medium">
                    {post.author_username ? `@${post.author_username}` : (post.author_role || "User")} • {formatRelativeTime(post.created_at)}
                  </p>
                </div>
              </div>

              {/* Description / Content */}
              <div className="mb-6">
                <p className="text-slate-600 leading-relaxed text-[15px] sm:text-[16px] whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>

              {/* Post media */}
              {post.media_url && (
                <div className="mb-6 rounded-2xl overflow-hidden shadow-xs border border-slate-200/60 bg-slate-50">
                  <ImageWithFallback
                    src={post.media_url}
                    alt="Post media visual"
                    className="w-full h-80 sm:h-96 object-cover"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <button className="flex items-center space-x-2 text-slate-500 hover:text-rose-500 transition-colors group px-2 py-1.5 rounded-full hover:bg-rose-50">
                    <Heart className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform group-active:scale-90" />
                  </button>
                  <button className="flex items-center space-x-2 text-slate-500 hover:text-indigo-500 transition-colors group px-2 py-1.5 rounded-full hover:bg-indigo-50">
                    <MessageSquare className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform group-active:scale-90" />
                  </button>
                  <button className="flex items-center space-x-2 text-slate-500 hover:text-emerald-500 transition-colors group px-2 py-1.5 rounded-full hover:bg-emerald-50">
                    <Share2 className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform group-active:scale-90" />
                  </button>
                  <button className="flex items-center space-x-2 text-slate-500 hover:text-amber-500 transition-colors group px-2 py-1.5 rounded-full hover:bg-amber-50">
                    <Bookmark className="w-4.5 h-4.5 sm:w-5 sm:h-5 transition-transform group-active:scale-90" />
                  </button>
                </div>
              </div>
            </article>

            {/* Comments Section */}
            {id && (
              <CommentSection targetType="post" targetId={id} />
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
