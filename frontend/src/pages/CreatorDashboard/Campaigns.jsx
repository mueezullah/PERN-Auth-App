import React from "react";
import { Megaphone } from "lucide-react";

/**
 * Placeholder for the Creator Dashboard Campaigns page.
 * Will list all campaigns owned by the current user in a future phase.
 */
const Campaigns = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-10 text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 bg-linear-to-br from-indigo-50 to-violet-50 rounded-full flex items-center justify-center border border-indigo-100">
          <Megaphone className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">My Campaigns</h2>
        <p className="text-slate-500 text-[15px]">
          Your campaign management dashboard is coming soon. For now, create campaigns from the Feed page.
        </p>
      </div>
    </div>
  );
};

export default Campaigns;
