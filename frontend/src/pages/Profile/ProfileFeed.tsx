import React, { useState } from 'react';
import { Eye, ChevronRight, Plus, SlidersHorizontal, Image as ImageIcon, CircleDollarSign } from 'lucide-react';
import { clsx } from 'clsx';

export function ProfileFeed({ name, username }: { name?: string; username?: string }) {
  const [activeTab, setActiveTab] = useState('Posts');
  const tabs = ['Posts', 'Campaigns', 'Donations', 'Saved', 'About'];
  const displayName = name;
  const displayUsername = username;

  return (
    <div className="w-full max-w-175 mx-auto py-8 flex flex-col">
      {/* Header Info */}
      <div className="flex items-center space-x-4 mb-6 px-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-[#1CD4D4] flex items-center justify-center overflow-hidden border-4 border-slate-50">
            {/* Using a placeholder for avatar if no real image */}
            <div className="w-12 h-12 bg-white rounded-full opacity-50" />
          </div>
          <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full border border-slate-200 shadow-sm">
            <ImageIcon className="w-4 h-4 text-slate-700" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">{displayName}</h1>
          {displayUsername && (
            <p className="text-[14px] text-slate-500 font-medium mt-0.5">u/{displayUsername}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 px-4 mb-4 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "px-4 py-2 rounded-full text-[14px] font-semibold transition-colors whitespace-nowrap",
              activeTab === tab
                ? "bg-slate-200/70 text-slate-900"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Showing all content bar */}
      <div className="px-4 mb-4">
        <div className="w-full bg-slate-100 hover:bg-slate-200/70 transition-colors rounded-xl p-3 flex items-center justify-between cursor-pointer">
          <div className="flex items-center space-x-2 text-slate-700">
            <Eye className="w-5 h-5" />
            <span className="text-[14px] font-medium">Showing all content</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center space-x-3 px-4 pb-4 border-b border-slate-200">
        <button className="flex items-center space-x-1.5 px-4 py-2 rounded-full border border-slate-300 hover:bg-slate-50 transition-colors">
          <Plus className="w-4 h-4 text-slate-700" />
          <span className="text-[14px] font-semibold text-slate-700">New Campaign</span>
        </button>
        <button className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-6 text-center">
        {/* Abstract Funding Avatar Placeholder for empty state */}
        <div className="relative w-32 h-32 mb-6 opacity-80 flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-indigo-100 rounded-full scale-90" />
          <div className="absolute inset-0 bg-indigo-50 rounded-full flex items-center justify-center">
            <CircleDollarSign className="w-12 h-12 text-indigo-400" strokeWidth={1.5} />
          </div>
        </div>

        <h2 className="text-[22px] font-bold text-slate-900 mb-2">No activity yet</h2>
        <p className="text-[15px] text-slate-500 max-w-md">
          Once you create a campaign or make a donation, it'll show up here.
        </p>
      </div>
    </div>
  );
}