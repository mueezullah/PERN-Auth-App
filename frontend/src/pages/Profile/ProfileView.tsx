import React, { useEffect, useState } from "react";
import { ProfileFeed } from "./ProfileFeed";
import { ProfileRightSidebar } from "./RightCard";
import { useParams, useLocation } from "react-router-dom";
import { fetchUserProfileStats } from "../../features/profile/profileAPI";

type ProfileStats = {
  id?: number;
  name?: string;
  username?: string;
  role?: string;
  posts: number;
  campaigns: number;
  backedProjects: number;
  totalContributed: number;
  createdAt?: string;
};

export function ProfileView() {
  const { username: paramUsername } = useParams<{ username: string }>();
  const location = useLocation();
  const stateName = (location.state as { name?: string } | null)?.name;
  const loggedInUsername = localStorage.getItem("username");
  const isOwnProfile = !paramUsername || paramUsername === loggedInUsername;
  // When viewing own profile, use localStorage name; for others, use stateName if available, fallback to paramUsername
  const name = isOwnProfile ? (localStorage.getItem("name") || paramUsername) : (stateName || paramUsername);
  const username = paramUsername || loggedInUsername;
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);

  useEffect(() => {
    const loadProfileStats = async () => {
      if (!username) {
        return;
      }
      try {
        const stats = await fetchUserProfileStats(username);
        setProfileStats(stats);
      } catch (error) {
        console.error("Unable to load profile stats", error);
      }
    };

    loadProfileStats();
  }, [username]);

  return (
    <div className="w-full max-w-275 mx-auto flex gap-8">
      <div className="flex-1">
        <ProfileFeed
          name={profileStats?.name || name || undefined}
          username={username ?? undefined}
          isOwnProfile={isOwnProfile}
        />
      </div>
      <div className="hidden xl:block w-75 shrink-0">
        <ProfileRightSidebar
          name={profileStats?.name || name}
          username={username ?? undefined}
          userId={profileStats?.id}
          profileStats={profileStats}
          isOwnProfile={isOwnProfile}
        />
      </div>
    </div>
  );
}
