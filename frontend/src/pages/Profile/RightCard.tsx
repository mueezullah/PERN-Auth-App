import React from 'react';
import { Share, Image as ImageIcon, Plus, Edit } from 'lucide-react';

export function ProfileRightSidebar({ name }: { name?: string }) {
  const displayUsername = name || 'WizardX';

  return (
    <div className="w-full py-8 pr-4 flex flex-col space-y-4">
      <div className="bg-white rounded-[20px] shadow-sm border border-slate-200/60 overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-b from-[#0F2044] to-[#040B1A] relative">
          <button className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors">
            <ImageIcon className="w-4 h-4 text-slate-800" />
          </button>
        </div>
        
        {/* Profile Info Card Content */}
        <div className="p-5 flex flex-col">
          <h2 className="text-[20px] font-bold text-slate-900">{displayUsername}</h2>
          
          <div className="flex space-x-3 mb-6 mt-4">
            
            <button className="flex items-center space-x-2 w-fit bg-slate-100 hover:bg-slate-200/70 text-slate-900 font-semibold text-[14px] px-4 py-1.5 rounded-full transition-colors">
              <Edit className="w-4 h-4" />
              <span>Update/Edit</span>
            </button>
            <button className="flex items-center space-x-2 w-fit bg-slate-100 hover:bg-slate-200/70 text-slate-900 font-semibold text-[14px] px-4 py-1.5 rounded-full transition-colors">
              <Share className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-4 mb-6">
            <p className="text-[14px] font-bold text-slate-700 hover:underline cursor-pointer">0 following</p>
            <p className="text-[14px] font-bold text-slate-700 hover:underline cursor-pointer">0 followers</p>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-6">
            <div>
              <p className="text-[16px] font-bold text-slate-900 leading-tight">0</p>
              <p className="text-[13px] text-slate-500 font-medium">Posts/Campaigns</p>
            </div>
            <div>
              <p className="text-[16px] font-bold text-slate-900 leading-tight">0</p>
              <p className="text-[13px] text-slate-500 font-medium">Backed Projects</p>
            </div>
            <div>
              <p className="text-[16px] font-bold text-slate-900 leading-tight">$0</p>
              <p className="text-[13px] text-slate-500 font-medium">Total Contributed</p>
            </div>
            <div>
              <p className="text-[16px] font-bold text-slate-900 leading-tight flex items-center space-x-1">
                <span className="text-amber-500 text-[18px]">★</span>
                <span>Starter</span>
              </p>
              <p className="text-[13px] text-slate-500 font-medium hover:underline cursor-pointer">Impact Level &gt;</p>
            </div>
          </div>
          
          {/* Single Stat */}
          <div className="mb-6">
            <p className="text-[16px] font-bold text-slate-900 leading-tight">2026</p>
            <p className="text-[13px] text-slate-500 font-medium">Member Since</p>
          </div>
          
          <div className="border-t border-slate-200/60 my-2 -mx-5 px-5" />
          
          {/* Social Links Section (Replacing Achievements) */}
          <div className="py-2">
            <h3 className="text-[12px] font-semibold text-slate-500 tracking-wide uppercase mb-3">Social Links</h3>
            <button className="flex items-center space-x-1.5 w-fit bg-slate-100/80 hover:bg-slate-200/70 text-slate-900 font-semibold text-[14px] px-4 py-2 rounded-full transition-colors">
              <Plus className="w-5 h-5" />
              <span>Add Social Link</span>
            </button>
          </div>
          

          
        </div>
      </div>
    </div>
  );
}