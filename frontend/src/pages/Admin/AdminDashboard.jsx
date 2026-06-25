import React, { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { handleSuccess, handleError } from "../../utils";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import OverviewTab from "./components/OverviewTab";
import UsersTab from "./components/UsersTab";
import CampaignsTab from "./components/CampaignsTab";

const AdminDashboard = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campaignsError, setCampaignsError] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle Logout functionality
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
  };

  // Handle Feed navigation
  const handleFeedClick = () => {
    navigate("/feed");
  };

  // Handle Role Change functionality
  const handleRoleChange = async (userId, newRole) => {
    console.log(`Changing user ${userId} to role: ${newRole}`);
    const token = localStorage.getItem("token");
    const originalUsers = [...users];

    // Optimistically update the UI role
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BASE_API_URL}/auth/users/${userId}/role`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        handleSuccess(data.message || "Role updated successfully");
        if (data.user) {
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === userId ? { ...user, ...data.user } : user
            )
          );
        }
      } else {
        handleError(data.message || "Failed to update role");
        setUsers(originalUsers);
      }
    } catch (err) {
      console.error(err);
      handleError("Failed to connect to server");
      setUsers(originalUsers);
    }
  };

  const name = localStorage.getItem("name");

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/auth/users`,
          {
            headers: {
              Authorization: token,
            },
          },
        );
        const data = await response.json();
        if (data.success) {
          setUsers(data.users);
        } else {
          setError(data.message || "Failed to fetch users");
        }
      } catch (err) {
        setError("Failed to connect to server");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Fetch campaigns from backend
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setCampaignsLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BASE_API_URL}/campaigns?page=1&limit=100&status=all`,
        );
        const data = await response.json();
        if (data.success) {
          setCampaigns(data.data.campaigns || []);
        } else {
          setCampaignsError(data.message || "Failed to fetch campaigns");
        }
      } catch (err) {
        setCampaignsError("Failed to connect to server");
        console.error(err);
      } finally {
        setCampaignsLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <AdminSidebar
        activeView={activeView}
        setActiveView={setActiveView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader
          activeView={activeView}
          name={name}
          handleFeedClick={handleFeedClick}
          handleLogout={handleLogout}
          setSidebarOpen={setSidebarOpen}
        />

        {/* --- SCROLLABLE CONTENT --- */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* ===== DASHBOARD VIEW ===== */}
          {activeView === "dashboard" && (
            <OverviewTab users={users} campaigns={campaigns} />
          )}

          {/* ===== USERS VIEW ===== */}
          {activeView === "users" && (
            <UsersTab
              users={users}
              loading={loading}
              error={error}
              handleRoleChange={handleRoleChange}
            />
          )}

          {/* ===== CAMPAIGNS VIEW ===== */}
          {activeView === "campaigns" && (
            <CampaignsTab
              campaigns={campaigns}
              campaignsLoading={campaignsLoading}
              campaignsError={campaignsError}
            />
          )}

          {/* ===== SETTINGS VIEW ===== */}
          {activeView === "settings" && (
            <div className="text-center py-20 text-gray-400">
              <Settings className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg">Settings section coming soon.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
