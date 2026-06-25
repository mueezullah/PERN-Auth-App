import React from "react";
import { Navbar } from "./components/Navbar";
import { Sidebar } from "./components/Sidebar";
import { Feed } from "./components/Feed";
import { RightSidebar } from "./components/RightSidebar";

export default function FeedMain({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) {
  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">
      <Navbar setIsAuthenticated={setIsAuthenticated} />
      <main className="flex-1 mt-16 max-w-384 mx-10 w-full grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-0 lg:gap-1 px-0 lg:px-0">
        <div className="hidden lg:block h-[calc(100vh-64px)] overflow-y-auto relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full transition-colors">
          <Sidebar />
        </div>
        <div className="bg-transparent border-l h-[calc(100vh-64px)] overflow-y-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="w-full max-w-275 mx-auto flex gap-8">
            <div className="flex-1">
              <Feed />
            </div>
            <div className="hidden xl:block w-75 shrink-0">
              <RightSidebar />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}