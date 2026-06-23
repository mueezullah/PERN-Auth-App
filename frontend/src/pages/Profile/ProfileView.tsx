import React from "react";
import { ProfileFeed } from "./ProfileFeed";
import { ProfileRightSidebar } from "./RightCard";
import { useParams } from "react-router";

export function ProfileView() {
  const { username: paramUsername } = useParams<{ username: string }>();
  // name is fetched from localStorage for the current user's own profile
  const name = localStorage.getItem("loggedInUser") || paramUsername || "User";
  const username = localStorage.getItem("username") || paramUsername;

  return (
    <div className="w-full max-w-[1100px] mx-auto flex gap-8">
      <div className="flex-1">
        <ProfileFeed name={name} username={username} />
      </div>
      <div className="hidden xl:block w-[300px] shrink-0">
        <ProfileRightSidebar name={name} />
      </div>
    </div>
  );
}
