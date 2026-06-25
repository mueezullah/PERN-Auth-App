import React, { useEffect, useState } from "react";
import { ProfileFeed } from "./ProfileFeed";
import { ProfileRightSidebar } from "./RightCard";
import { useParams } from "react-router";
import { fetchUserProfileStats } from "../../features/profile/profileAPI";

type ProfileStats = {
  name?: string;
  username?: string;
  posts: number;
  campaigns: number;
  backedProjects: number;
  totalContributed: number;
  createdAt?: string;
};

export function ProfileView() {
  const { username: paramUsername } = useParams<{ username: string }>();
  const name = localStorage.getItem("name") || paramUsername;
  const username = localStorage.getItem("username") || paramUsername;
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
        <ProfileFeed name={name} username={username} />
      </div>
      <div className="hidden xl:block w-75 shrink-0">
        <ProfileRightSidebar name={profileStats?.name || name} profileStats={profileStats} />
      </div>
    </div>
  );
}
