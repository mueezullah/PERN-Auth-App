import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const MINIMAL_TOAST_EVENT = "minimal-toast";

export function showMinimalToast(message: string) {
  const event = new CustomEvent(MINIMAL_TOAST_EVENT, { detail: message });
  window.dispatchEvent(event);
}

export default function MinimalToast() {
  const [toast, setToast] = useState<{ id: string; message: string } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  const triggerToast = (message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToast({ id, message });
  };

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const message = (e as CustomEvent<string>).detail;
      triggerToast(message);
    };

    window.addEventListener(MINIMAL_TOAST_EVENT, handleToastEvent);

    // Initial check on mount (e.g. page reload)
    const pending = sessionStorage.getItem("pendingToast");
    if (pending) {
      triggerToast(pending);
      sessionStorage.removeItem("pendingToast");
    }

    return () => {
      window.removeEventListener(MINIMAL_TOAST_EVENT, handleToastEvent);
    };
  }, []);

  // Check on route changes (client-side navigation)
  useEffect(() => {
    const pending = sessionStorage.getItem("pendingToast");
    if (pending) {
      triggerToast(pending);
      sessionStorage.removeItem("pendingToast");
    }
  }, [location]);

  useEffect(() => {
    if (toast) {
      setIsVisible(true);
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        const clearTimer = setTimeout(() => {
          setToast(null);
        }, 500); // match transition duration
        return () => clearTimeout(clearTimer);
      }, 3000);

      return () => clearTimeout(hideTimer);
    }
  }, [toast]);

  if (!toast) return null;

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-[999] pointer-events-none transition-all duration-500 ease-out ${
        isVisible
          ? "translate-y-0 opacity-100 scale-100"
          : "-translate-y-6 opacity-0 scale-95"
      }`}
    >
      <div className="bg-slate-950/90 backdrop-blur-md border border-white/10 text-white px-5 py-2.5 rounded-xl shadow-2xl shadow-black/40 flex items-center gap-3 pointer-events-auto">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        <span className="text-[13px] sm:text-[14px] font-semibold tracking-wide select-none">
          {toast.message}
        </span>
      </div>
    </div>
  );
}
