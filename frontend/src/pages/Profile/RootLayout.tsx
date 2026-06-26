import React from 'react';
import { Navbar } from '../Feed/components/Navbar';
import { Sidebar } from '../Feed/components/Sidebar';
import { Outlet } from 'react-router';

export function RootLayout() {
  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">
      <Navbar />
      <main className="flex-1 mt-16 max-w-384 mx-10 w-full grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-0 lg:gap-1 px-0 lg:px-0">
        <div className="hidden lg:block h-[calc(100vh-64px)] overflow-y-auto relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full transition-colors">
          <Sidebar />
        </div>
        <div className="bg-transparent border-l h-[calc(100vh-64px)] overflow-y-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Outlet />
        </div>
      </main>
    </div>
  );
}