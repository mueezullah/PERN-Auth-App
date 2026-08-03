import React, { useEffect, useState } from "react";
import { X, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FollowButton } from "./FollowButton";

interface FollowUser {
  id: number;
  name: string;
  username?: string;
  email?: string;
  profile_picture?: string;
}

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  type: "followers" | "following";
}

export function FollowListModal({ isOpen, onClose, userId, type }: FollowListModalProps) {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen || !userId) return;

    async function fetchList() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/follows/${userId}/${type}`
        );
        const data = await res.json();
        if (res.ok && data.success) {
          setUsers(data.followers || data.following || []);
        } else {
          setError(data.message || "Failed to load list");
        }
      } catch (err) {
        console.error("Failed to load follow list:", err);
        setError("Error connecting to server");
      } finally {
        setLoading(false);
      }
    }

    fetchList();
  }, [isOpen, userId, type]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-slate-100 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900 capitalize">{type}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User list content */}
        <div className="overflow-y-auto flex-1 py-4 space-y-4">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading {type}…</div>
          ) : error ? (
            <div className="text-center py-8 text-rose-500">{error}</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No {type} yet.
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                <div
                  onClick={() => {
                    onClose();
                    navigate(`/profile/${user.username || user.id}`);
                  }}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-slate-500">
                    {user.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {user.name}
                    </p>
                    {user.username && (
                      <p className="text-xs text-slate-500 truncate">
                        @{user.username}
                      </p>
                    )}
                  </div>
                </div>

                {/* Follow Button for listed user */}
                <FollowButton targetUserId={user.id} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
