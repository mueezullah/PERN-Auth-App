import React, { useState, useRef, useCallback, useEffect } from "react";
import { X, Image as ImageIcon, Film, Smile, Send, Loader2, AtSign, Pencil } from "lucide-react";
import { showMinimalToast } from "../../../components/MinimalToast";
import { useCreatePost } from "../../../features/Posts/postsSlice";
import * as postsAPI from "../../../features/Posts/postsAPI";
import { handleSuccess, handleError } from "../../../utils";

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newPost: any) => void;
  editMode?: boolean;
  editPostId?: string;
  initialContent?: string;
  initialImage?: string;
}

const MAX_CHARS = 500;

export function CreateThreadModal({
  isOpen,
  onClose,
  onSuccess,
  editMode = false,
  editPostId,
  initialContent = "",
  initialImage,
}: CreateThreadModalProps) {
  const [message, setMessage] = useState(editMode ? initialContent : "");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(
    editMode && initialImage ? initialImage : null
  );
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(
    editMode && initialImage ? "image" : null
  );
  const [dragOver, setDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { create, loading: isPosting, error: createError } = useCreatePost();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const username = localStorage.getItem("name") || "User";
  const charsLeft = MAX_CHARS - message.length;
  const isOverLimit = charsLeft < 0;
  const isEmpty = message.trim().length === 0 && !mediaFile;

  // Reset form state when the modal opens/closes or switches between modes
  useEffect(() => {
    if (isOpen) {
      setMessage(editMode ? initialContent : "");
      setMediaPreview(editMode && initialImage ? initialImage : null);
      setMediaFile(null);
      setMediaType(editMode && initialImage ? "image" : null);
      setSubmitError(null);
    }
  }, [isOpen, editMode, initialContent, initialImage]);

  const handleFileSelect = (file: File) => {
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) return;

    setMediaFile(file);
    setMediaType(isImage ? "image" : "video");
    const url = URL.createObjectURL(file);
    setMediaPreview(url);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleSubmit = async () => {
    if (isEmpty || isOverLimit || isPosting || isSubmitting) return;
    setSubmitError(null);

    try {
      if (editMode && editPostId) {
        // --- EDIT mode: PUT ---
        setIsSubmitting(true);
        const updatedPost = await postsAPI.updatePost(editPostId, {
          content: message,
          mediaUrl: mediaPreview || "",
        });
        showMinimalToast("Post Updated Successfully");
        if (onSuccess) onSuccess(updatedPost);
        onClose();
      } else {
        // --- CREATE mode: POST ---
        const newPost = await create({
          content: message,
          mediaUrl: "",
        });
        showMinimalToast("Post Created");
        setMessage("");
        removeMedia();
        onClose();
        if (onSuccess) {
          onSuccess(newPost);
        }
      }
    } catch (err: any) {
      const msg = err.message || "Something went wrong";
      setSubmitError(msg);
      handleError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  const isBusy = isPosting || isSubmitting;
  const displayError = submitError || createError;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-[560px] bg-white rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden animate-in"
        style={{ animation: "slideUp 0.2s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            {editMode && (
              <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center">
                <Pencil className="w-3.5 h-3.5 text-indigo-600" />
              </div>
            )}
            <h2 className="text-[17px] font-extrabold text-slate-900 tracking-tight">
              {editMode ? "Edit Post" : "New Thread"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 pt-4 pb-2">
          {/* User Row */}
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-slate-900 mb-2">{username}</p>
              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleTextareaInput}
                placeholder={
                  editMode
                    ? "Update your post..."
                    : "What's on your mind? Share a thought, update, or story..."
                }
                rows={3}
                className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-[15px] leading-relaxed focus:outline-none resize-none overflow-hidden"
                style={{ minHeight: "80px" }}
                autoFocus
              />
              {displayError && (
                <p className="text-red-500 text-xs mt-1">{displayError}</p>
              )}
            </div>
          </div>

          {/* Media Preview */}
          {mediaPreview && (
            <div className="relative ml-13 mb-4 rounded-2xl overflow-hidden border border-slate-200/60 bg-slate-50 group" style={{ marginLeft: "52px" }}>
              {mediaType === "image" ? (
                <img
                  src={mediaPreview}
                  alt="Media preview"
                  className="w-full max-h-64 object-cover"
                />
              ) : (
                <video
                  src={mediaPreview}
                  controls
                  className="w-full max-h-64 object-cover"
                />
              )}
              <button
                onClick={removeMedia}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-900 transition-colors backdrop-blur-sm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/60 rounded-full text-white text-[11px] font-medium backdrop-blur-sm capitalize">
                {mediaType}
              </div>
            </div>
          )}

          {/* Drop Zone (shown only when no media) */}
          {!mediaPreview && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`ml-13 mb-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-center py-5 text-slate-400 text-[13px] font-medium space-x-2 ${dragOver
                  ? "border-indigo-400 bg-indigo-50 text-indigo-500"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              style={{ marginLeft: "52px" }}
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="w-4 h-4" />
              <span>
                {editMode ? "Change media" : "Drop or click to attach media"}{" "}
                <span className="text-slate-300 font-normal">(optional)</span>
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex items-center justify-between">
          {/* Toolbar */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Add Image"
              className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Add Video"
              className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors"
            >
              <Film className="w-4 h-4" />
            </button>
            <button
              title="Mention"
              className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors"
            >
              <AtSign className="w-4 h-4" />
            </button>
            <button
              title="Emoji"
              className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>

          {/* Char count + Submit */}
          <div className="flex items-center space-x-3">
            {/* Char counter ring */}
            <div className="relative w-6 h-6">
              <svg className="w-6 h-6 -rotate-90" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  fill="none"
                  stroke={isOverLimit ? "#ef4444" : charsLeft < 50 ? "#f59e0b" : "#6366f1"}
                  strokeWidth="2.5"
                  strokeDasharray={`${Math.max(0, Math.min(56.5, (message.length / MAX_CHARS) * 56.5))} 56.5`}
                  strokeLinecap="round"
                />
              </svg>
              {charsLeft <= 50 && (
                <span
                  className={`absolute inset-0 flex items-center justify-center text-[9px] font-bold ${isOverLimit ? "text-red-500" : "text-amber-500"
                    }`}
                >
                  {charsLeft}
                </span>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isEmpty || isOverLimit || isBusy}
              className={`flex items-center space-x-2 px-5 py-2 text-white text-[13px] font-bold rounded-full active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm ${editMode
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-slate-900 hover:bg-slate-800"
                }`}
            >
              {isBusy ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{editMode ? "Saving..." : "Posting..."}</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{editMode ? "Save Changes" : "Post"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileInputChange}
      />

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>
  );
}
