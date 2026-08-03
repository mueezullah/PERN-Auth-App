import React, { useState, useEffect } from "react";
import { UserPlus, UserCheck, UserMinus, Loader2 } from "lucide-react";

interface FollowButtonProps {
    targetUserId: number;
    onFollowChange?: (newIsFollowing: boolean, followersCount: number, followingCount: number) => void;
    className?: string;
}

export function FollowButton({ targetUserId, onFollowChange, className = "" }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [actionLoading, setActionLoading] = useState<boolean>(false);
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const token = localStorage.getItem("token");
    const currentUserId = Number(localStorage.getItem("userId")); // Assuming stored during auth

    // Fetch initial follow status
    useEffect(() => {
        async function fetchFollowStatus() {
            if (!targetUserId) return;
            try {
                setLoading(true);
                const res = await fetch(
                    `${import.meta.env.VITE_BASE_API_URL}/follows/${targetUserId}/status`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const data = await res.json();
                if (res.ok && data.success) {
                    setIsFollowing(data.isFollowing);
                }
            } catch (err) {
                console.error("Failed to load follow status:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchFollowStatus();
    }, [targetUserId, token]);

    // Hide button if viewing own profile
    if (currentUserId && currentUserId === targetUserId) {
        return null;
    }

    const handleToggleFollow = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!token) {
            alert("Please log in to follow creators.");
            return;
        }
        if (actionLoading) return;

        setActionLoading(true);
        // Optimistic toggle
        const prevFollowingState = isFollowing;
        setIsFollowing(!prevFollowingState);

        try {
            const res = await fetch(
                `${import.meta.env.VITE_BASE_API_URL}/follows/${targetUserId}/toggle`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await res.json();
            if (!res.ok || !data.success) {
                // Revert on error
                setIsFollowing(prevFollowingState);
            } else {
                setIsFollowing(data.isFollowing);
                if (onFollowChange) {
                    onFollowChange(data.isFollowing, data.followersCount, data.followingCount);
                }
            }
        } catch (err) {
            console.error("Failed to toggle follow:", err);
            setIsFollowing(prevFollowingState);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <button
                disabled
                className={`px-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-slate-400 text-sm font-semibold flex items-center justify-center gap-2 ${className}`}
            >
                <Loader2 className="w-4 h-4 animate-spin" />
            </button>
        );
    }

    return (
        <button
            onClick={handleToggleFollow}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={actionLoading}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${isFollowing
                ? isHovered
                    ? "bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100"
                    : "bg-slate-100 border border-slate-300 text-slate-800"
                : "bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                } ${className}`}
        >
            {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : isFollowing ? (
                isHovered ? (
                    <>
                        <UserMinus className="w-4 h-4" />
                        <span>Unfollow</span>
                    </>
                ) : (
                    <>
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span>Following</span>
                    </>
                )
            ) : (
                <>
                    <UserPlus className="w-4 h-4" />
                    <span>Follow</span>
                </>
            )}
        </button>
    );
}
