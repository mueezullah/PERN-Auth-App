import React, { useState } from "react";
import { Send, MessageSquare, Trash2 } from "lucide-react";
import { useComments } from "../../features/comments/useComments";
import { formatRelativeTime } from "../../utils";
import { handleError } from "../../utils";

interface CommentSectionProps {
  id?: number;
  content?: string;
  created_at?: string;
  targetType: "campaign" | "post";
  targetId: string | number;
}


export function CommentSection({ targetType, targetId }: CommentSectionProps) {
  const { comments, loading, error, addComment, removeComment } = useComments(targetType, targetId) as {
    comments: any[];
    loading: boolean;
    error: string | null;
    addComment: (content: string) => Promise<void>;
    removeComment: (commentId: number) => Promise<void>;
  };
  const currentUserId = localStorage.getItem("userId") ? parseInt(localStorage.getItem("userId")!, 10) : null;

  const handleDelete = async (commentId: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this comment?")) return;
    try {
      await removeComment(commentId);
    } catch (err: any) {
      handleError(err.message || "Failed to delete comment");
    }
  };

  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment(trimmed);
      setInputText("");
    } catch (err: any) {
      handleError(err.message || "Failed to submit comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <h3 className="font-bold text-slate-900 text-[16px] flex items-center gap-2">
          <MessageSquare className="w-4.5 h-4.5 text-indigo-500" />
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment List */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-slate-50/30">
        {loading && comments.length === 0 ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-3.5 bg-slate-200 rounded-md w-1/4"></div>
                  <div className="h-3 bg-slate-200 rounded-md w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10 text-rose-500 font-medium text-sm">
            {error}
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
            <MessageSquare className="w-10 h-10 mb-3 text-slate-300" />
            <p className="text-[14px] font-semibold">No comments yet</p>
            <p className="text-[12px] mt-1 text-slate-400">Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => {
            const isTemp = String(comment.id).startsWith("temp_");
            return (
              <div
                key={comment.id}
                className={`flex gap-3 text-left transition-opacity duration-300 ${isTemp ? "opacity-60" : "opacity-100"
                  }`}
              >
                {/* User avatar initial */}
                <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-xs shrink-0 border border-slate-100 shadow-xs">
                  {comment.author_name ?
                    comment.author_name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-slate-900 text-[13.5px]">
                        {comment.author_name}
                      </span>
                      {comment.author_username && (
                        <span className="text-[11px] text-slate-500 font-medium">
                          @{comment.author_username}
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-medium select-none">
                        • {formatRelativeTime(comment.created_at)}
                      </span>
                    </div>
                    {/* Delete button if comment owner */}
                    {!isTemp && currentUserId === comment.user_id && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors duration-150 p-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-[13.5px] text-slate-700 leading-relaxed mt-1 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sticky Comment input bar */}
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 bg-white border-t border-slate-200/80 p-4 shrink-0 flex items-center gap-3"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Add a comment..."
          className="
            flex-1 h-10 px-4 rounded-full
            bg-slate-50 border border-slate-200/80
            text-[13.5px] text-slate-800 placeholder-slate-400
            outline-none
            focus:border-indigo-500/50 focus:bg-white
            transition-all duration-200
          "
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isSubmitting}
          className={`
            h-10 px-5 flex items-center justify-center gap-2 rounded-full font-bold text-[13px]
            transition-all duration-200
            cursor-pointer
            ${inputText.trim() && !isSubmitting
              ? "bg-slate-900 text-white hover:bg-slate-800 active:scale-95 shadow-sm"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }
          `}
        >
          {isSubmitting ? (
            <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <span>Post</span>
              <Send size={12} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
