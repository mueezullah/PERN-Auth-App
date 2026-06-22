import React from "react";
import { LayoutDashboard, Users, Megaphone, Settings, X } from "lucide-react";

const sidebarItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "users", label: "Users", icon: Users },
  { key: "campaigns", label: "Campaigns", icon: Megaphone },
  { key: "settings", label: "Settings", icon: Settings },
];

const SidebarNav = ({ activeView, setActiveView, setSidebarOpen }) => (
  <>
    <div className="flex items-center justify-between h-16 shrink-0 px-4 bg-indigo-950 text-white font-bold text-xl">
      FundMe
      <button
        onClick={() => setSidebarOpen(false)}
        className="md:hidden text-white cursor-pointer"
      >
        <X className="h-6 w-6" />
      </button>
    </div>
    <div className="flex-1 flex flex-col overflow-y-auto">
      <nav className="flex-1 px-2 py-4 space-y-2">
        {sidebarItems.map((item) => (
          <button
            key={item.key}
            onClick={() => {
              setActiveView(item.key);
              setSidebarOpen(false);
            }}
            className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer
                              ${
                                activeView === item.key
                                  ? "bg-indigo-800 text-white"
                                  : "text-indigo-300 hover:bg-indigo-700 hover:text-white"
                              }`}
          >
            <item.icon className="mr-3 h-6 w-6" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  </>
);

const AdminSidebar = ({ activeView, setActiveView, sidebarOpen, setSidebarOpen }) => {
  return (
    <>
      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Sliding sidebar panel */}
          <div className="relative flex flex-col w-64 h-full bg-indigo-900 shadow-xl z-50 animate-slide-in">
            <SidebarNav
              activeView={activeView}
              setActiveView={setActiveView}
              setSidebarOpen={setSidebarOpen}
            />
          </div>
        </div>
      )}

      {/* --- DESKTOP SIDEBAR (always visible on md+) --- */}
      <div className="hidden md:flex md:shrink-0">
        <div className="flex flex-col w-64 bg-indigo-900">
          <SidebarNav
            activeView={activeView}
            setActiveView={setActiveView}
            setSidebarOpen={setSidebarOpen}
          />
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
