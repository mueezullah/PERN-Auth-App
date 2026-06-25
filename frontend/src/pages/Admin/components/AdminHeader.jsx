import React from "react";
import { Menu, Home, LogOut } from "lucide-react";

const AdminHeader = ({
  activeView,
  name,
  handleFeedClick,
  handleLogout,
  setSidebarOpen,
}) => {
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">
            {activeView === "dashboard"
              ? "Overview"
              : activeView === "users"
                ? "User Management"
                : activeView === "campaigns"
                  ? "Campaigns"
                  : "Settings"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="mr-4 text-sm text-gray-600">
            Admin, {name}
          </span>
          <button
            onClick={handleFeedClick}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer"
          >
            <Home className="h-4 w-4 mr-2" />
            <span>Feed</span>
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
