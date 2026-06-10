import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../../utils";
import { useCreateCampaign } from "../../features/creator/creatorSlice";
import * as creatorAPI from "../../features/creator/creatorAPI";
import { X, Megaphone, Image as ImageIcon, CalendarDays, DollarSign, FileText, Pencil, Save } from "lucide-react";

/**
 * CreateCampaignModal
 *
 * Used in two modes:
 *  1. Create mode  (default) — full-page layout, navigates to /feed on success.
 *  2. Edit mode    — rendered as an overlay modal over the feed.
 *     Pass: editMode=true, editCampaignId, initialData
 *     The modal closes via onClose() on success.
 */
const CreateCampaignModal = ({
  // Edit-mode props (all optional — absent = create mode)
  editMode = false,
  editCampaignId,
  initialData,   // { title, description, goal_amount, deadline, media_url }
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const { create, loading: createLoading } = useCreateCampaign();
  const [updateLoading, setUpdateLoading] = useState(false);

  const loading = editMode ? updateLoading : createLoading;

  const buildInitialForm = () => {
    if (editMode && initialData) {
      return {
        title: initialData.title || "",
        description: initialData.description || "",
        goal_amount: String(initialData.goal_amount || ""),
        // Convert ISO deadline to date input value (YYYY-MM-DD)
        deadline: initialData.deadline
          ? new Date(initialData.deadline).toISOString().split("T")[0]
          : "",
        media_url: initialData.media_url || "",
      };
    }
    return { title: "", description: "", goal_amount: "", deadline: "", media_url: "" };
  };

  const [form, setForm] = useState(buildInitialForm);
  const [errors, setErrors] = useState({});

  // Re-populate when edit data changes (e.g. switching to a different card)
  useEffect(() => {
    if (editMode && initialData) {
      setForm(buildInitialForm());
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode, editCampaignId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim()) newErrors.description = "Description is required";

    if (!form.goal_amount) {
      newErrors.goal_amount = "Goal amount is required";
    } else if (parseFloat(form.goal_amount) <= 0) {
      newErrors.goal_amount = "Goal must be greater than $0";
    }

    if (!form.deadline) {
      newErrors.deadline = "Deadline is required";
    } else if (new Date(form.deadline) <= new Date()) {
      newErrors.deadline = "Deadline must be in the future";
    }

    if (form.media_url && !isValidUrl(form.media_url)) {
      newErrors.media_url = "Enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (str) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      goal_amount: parseFloat(form.goal_amount),
      deadline: form.deadline,
      media_url: form.media_url.trim() || null,
    };

    try {
      if (editMode && editCampaignId) {
        // --- EDIT ---
        setUpdateLoading(true);
        const updated = await creatorAPI.updateCampaign(editCampaignId, payload);
        handleSuccess("Campaign updated successfully!");
        if (onSuccess) onSuccess(updated);
        if (onClose) onClose();
      } else {
        // --- CREATE ---
        await create(payload);
        handleSuccess("Campaign created successfully!");
        setTimeout(() => navigate("/feed"), 1000);
      }
    } catch (err) {
      handleError(err.message || `Failed to ${editMode ? "update" : "create"} campaign`);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Minimum date for deadline (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  // ── EDIT MODE: render as an overlay modal ──────────────────────────────────
  if (editMode) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4 py-6 overflow-y-auto"
        onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}
      >
        <div
          className="w-full max-w-[620px] bg-white rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden my-auto"
          style={{ animation: "slideUp 0.2s ease-out" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                <Pencil className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-[17px] font-extrabold text-slate-900 tracking-tight">
                  Edit Campaign
                </h2>
                <p className="text-[12px] text-slate-400 font-medium">
                  Changes will be saved as{" "}
                  <span className="text-indigo-500 font-semibold">updated</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {/* Title */}
            <div>
              <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                <FileText className="w-4 h-4 mr-2 text-slate-400" />
                Campaign Title
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Give your campaign a compelling title..."
                className={`w-full px-4 py-3 bg-slate-50 rounded-xl border ${errors.title ? "border-red-300 focus:border-red-400 focus:ring-red-200" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"} focus:outline-none focus:ring-2 text-[15px] text-slate-900 placeholder-slate-400 transition-all`}
              />
              {errors.title && <p className="text-red-500 text-[13px] mt-1.5 font-medium">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                <FileText className="w-4 h-4 mr-2 text-slate-400" />
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Tell people about your campaign..."
                rows={4}
                className={`w-full px-4 py-3 bg-slate-50 rounded-xl border ${errors.description ? "border-red-300 focus:border-red-400 focus:ring-red-200" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"} focus:outline-none focus:ring-2 text-[15px] text-slate-900 placeholder-slate-400 transition-all resize-none`}
              />
              {errors.description && <p className="text-red-500 text-[13px] mt-1.5 font-medium">{errors.description}</p>}
            </div>

            {/* Goal + Deadline */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                  <DollarSign className="w-4 h-4 mr-2 text-slate-400" />
                  Goal Amount (USD)
                </label>
                <input
                  type="number"
                  name="goal_amount"
                  value={form.goal_amount}
                  onChange={handleChange}
                  placeholder="10000"
                  min="1"
                  step="0.01"
                  className={`w-full px-4 py-3 bg-slate-50 rounded-xl border ${errors.goal_amount ? "border-red-300 focus:border-red-400 focus:ring-red-200" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"} focus:outline-none focus:ring-2 text-[15px] text-slate-900 placeholder-slate-400 transition-all`}
                />
                {errors.goal_amount && <p className="text-red-500 text-[13px] mt-1.5 font-medium">{errors.goal_amount}</p>}
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                  <CalendarDays className="w-4 h-4 mr-2 text-slate-400" />
                  Deadline
                </label>
                <input
                  type="date"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  min={minDate}
                  className={`w-full px-4 py-3 bg-slate-50 rounded-xl border ${errors.deadline ? "border-red-300 focus:border-red-400 focus:ring-red-200" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"} focus:outline-none focus:ring-2 text-[15px] text-slate-900 transition-all`}
                />
                {errors.deadline && <p className="text-red-500 text-[13px] mt-1.5 font-medium">{errors.deadline}</p>}
              </div>
            </div>

            {/* Media URL */}
            <div>
              <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                <ImageIcon className="w-4 h-4 mr-2 text-slate-400" />
                Media URL <span className="text-slate-400 font-normal ml-1">(optional)</span>
              </label>
              <input
                type="url"
                name="media_url"
                value={form.media_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className={`w-full px-4 py-3 bg-slate-50 rounded-xl border ${errors.media_url ? "border-red-300 focus:border-red-400 focus:ring-red-200" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"} focus:outline-none focus:ring-2 text-[15px] text-slate-900 placeholder-slate-400 transition-all`}
              />
              {errors.media_url && <p className="text-red-500 text-[13px] mt-1.5 font-medium">{errors.media_url}</p>}
              {form.media_url && isValidUrl(form.media_url) && (
                <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200/60 bg-slate-50">
                  <img
                    src={form.media_url}
                    alt="Preview"
                    className="w-full h-40 object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-[13px] font-semibold text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white text-[13px] font-bold rounded-full hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{loading ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </div>

        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(24px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0)    scale(1); }
          }
        `}</style>
      </div>
    );
  }

  // ── CREATE MODE: original full-page layout ─────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md z-50 px-4 md:px-8 flex items-center border-b border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <button
          onClick={() => navigate("/feed")}
          className="p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors mr-4"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1 text-lg font-bold text-slate-900 flex items-center space-x-2">
          <Megaphone className="w-5 h-5 text-indigo-600" />
          <span>Create Campaign</span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 bg-slate-900 text-white text-[14px] font-bold rounded-full hover:bg-slate-800 active:scale-95 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Publishing..." : "Publish"}
        </button>
      </div>

      {/* Form */}
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                  <FileText className="w-4 h-4 mr-2 text-slate-400" />
                  Campaign Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Give your campaign a compelling title..."
                  className={`w-full px-4 py-3 bg-slate-50 rounded-xl border ${errors.title ? "border-red-300 focus:border-red-400 focus:ring-red-200" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"} focus:outline-none focus:ring-2 text-[16px] text-slate-900 placeholder-slate-400 transition-all`}
                />
                {errors.title && <p className="text-red-500 text-[13px] mt-1.5 font-medium">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                  <FileText className="w-4 h-4 mr-2 text-slate-400" />
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Tell people about your campaign, why it matters, and how the funds will be used..."
                  rows={5}
                  className={`w-full px-4 py-3 bg-slate-50 rounded-xl border ${errors.description ? "border-red-300 focus:border-red-400 focus:ring-red-200" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"} focus:outline-none focus:ring-2 text-[16px] text-slate-900 placeholder-slate-400 transition-all resize-none`}
                />
                {errors.description && <p className="text-red-500 text-[13px] mt-1.5 font-medium">{errors.description}</p>}
              </div>

              {/* Goal Amount & Deadline Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                    <DollarSign className="w-4 h-4 mr-2 text-slate-400" />
                    Goal Amount (USD)
                  </label>
                  <input
                    type="number"
                    name="goal_amount"
                    value={form.goal_amount}
                    onChange={handleChange}
                    placeholder="10000"
                    min="1"
                    step="0.01"
                    className={`w-full px-4 py-3 bg-slate-50 rounded-xl border ${errors.goal_amount ? "border-red-300 focus:border-red-400 focus:ring-red-200" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"} focus:outline-none focus:ring-2 text-[16px] text-slate-900 placeholder-slate-400 transition-all`}
                  />
                  {errors.goal_amount && <p className="text-red-500 text-[13px] mt-1.5 font-medium">{errors.goal_amount}</p>}
                </div>

                <div>
                  <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                    <CalendarDays className="w-4 h-4 mr-2 text-slate-400" />
                    Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={form.deadline}
                    onChange={handleChange}
                    min={minDate}
                    className={`w-full px-4 py-3 bg-slate-50 rounded-xl border ${errors.deadline ? "border-red-300 focus:border-red-400 focus:ring-red-200" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"} focus:outline-none focus:ring-2 text-[16px] text-slate-900 placeholder-slate-400 transition-all`}
                  />
                  {errors.deadline && <p className="text-red-500 text-[13px] mt-1.5 font-medium">{errors.deadline}</p>}
                </div>
              </div>

              {/* Media URL */}
              <div>
                <label className="flex items-center text-sm font-semibold text-slate-700 mb-2">
                  <ImageIcon className="w-4 h-4 mr-2 text-slate-400" />
                  Media URL
                  <span className="text-slate-400 font-normal ml-1">(optional)</span>
                </label>
                <input
                  type="url"
                  name="media_url"
                  value={form.media_url}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className={`w-full px-4 py-3 bg-slate-50 rounded-xl border ${errors.media_url ? "border-red-300 focus:border-red-400 focus:ring-red-200" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-200"} focus:outline-none focus:ring-2 text-[16px] text-slate-900 placeholder-slate-400 transition-all`}
                />
                {errors.media_url && <p className="text-red-500 text-[13px] mt-1.5 font-medium">{errors.media_url}</p>}

                {/* Image Preview */}
                {form.media_url && isValidUrl(form.media_url) && (
                  <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200/60 bg-slate-50">
                    <img
                      src={form.media_url}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Mobile Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:hidden py-3 bg-slate-900 text-white text-[15px] font-bold rounded-full hover:bg-slate-800 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Publishing..." : "Publish Campaign"}
              </button>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default CreateCampaignModal;
