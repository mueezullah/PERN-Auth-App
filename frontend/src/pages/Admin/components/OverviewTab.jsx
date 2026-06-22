import React from "react";
import { Users, Megaphone, Settings } from "lucide-react";
import StatsCard from "./StatsCard";

const OverviewTab = ({ users, campaigns }) => {
  const activeCampaignsCount = campaigns.filter((c) => {
    const now = new Date();
    const deadline = new Date(c.deadline);
    return c.status === "active" && deadline > now;
  }).length;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <StatsCard
        title="Total Users"
        value={users.length.toLocaleString()}
        icon={Users}
        colorClass="bg-blue-500"
      />
      <StatsCard
        title="Total Campaigns Raised"
        value={campaigns.length.toLocaleString()}
        icon={Megaphone}
        colorClass="bg-purple-500"
      />
      <StatsCard
        title="Active Campaigns"
        value={activeCampaignsCount.toLocaleString()}
        icon={Settings}
        colorClass="bg-green-500"
      />
    </div>
  );
};

export default OverviewTab;
