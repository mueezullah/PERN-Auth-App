import React, { useState, useEffect } from "react";
import {
  Users,
  LogOut,
  LayoutDashboard,
  Megaphone,
  Settings,
  Shield,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Home,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { handleSuccess, handleError } from "../../utils";

// Avatar background color based on index
const avatarColors = [
  "bg-purple-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-indigo-500",
  "bg-pink-500",
  "bg-teal-500",
];

// --- HELPER COMPONENTS ---
// 1. Stats Card Component
const StatsCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white overflow-hidden shadow rounded-lg">
    <div className="p-5">
      <div className="flex items-center">
        <div className={`shrink-0 rounded-md p-3 ${colorClass}`}>
          {Icon && <Icon className="h-6 w-6 text-white" aria-hidden="true" />}
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd>
              <div className="text-lg font-bold text-gray-900">{value}</div>
            </dd>
          </dl>
        </div>
      </div>
    </div>
  </div>
);

// 2. Accordion Item Component
const AccordionItem = ({
  title,
  roleName,
  isOpen,
  onToggle,
  users,
  loading,
  error,
  handleRoleChange,
}) => {
  const filteredUsers = users.filter((u) => u.role === roleName);

  const roleBadgeClass =
    roleName === "admin"
      ? "bg-purple-100 text-purple-800"
      : roleName === "moderator"
        ? "bg-yellow-100 text-yellow-800"
        : roleName === "fundraiser"
          ? "bg-orange-100 text-orange-800"
          : "bg-green-100 text-green-800";

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          )}
          <span className="text-base font-semibold text-gray-800">{title}</span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadgeClass}`}
          >
            {loading ? "..." : filteredUsers.length}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-gray-200">
          {loading ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <div className="flex justify-center items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-indigo-600"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Loading...
              </div>
            </div>
          ) : error ? (
            <div className="px-6 py-8 text-center text-red-500">{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">
              No {roleName}s found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      KYC Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Change Role
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${avatarColors[index % avatarColors.length]}`}
                          >
                            {user.name.charAt(0)}
                          </div>
                          <div className="ml-3 text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${roleBadgeClass}`}
                        >
                          {user.role.charAt(0).toUpperCase() +
                            user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.kyc_verified
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.kyc_verified ? "Verified" : "Unverified"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center relative w-full max-w-45">
                          <Shield className="h-4 w-4 text-gray-400 absolute left-2 pointer-events-none" />
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(user.id, e.target.value)
                            }
                            className="block w-full pl-8 pr-3 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="fundraiser">Fundraiser</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- MAIN ADMIN DASHBOARD COMPONENT ---
const AdminDashboard = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [campaignsError, setCampaignsError] = useState(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [selectedRole, setSelectedRole] = useState("user");
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle Logout functionality
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("role");
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



  const loggedInUser = localStorage.getItem("loggedInUser");

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

  const roleOptions = [
    { key: "user", label: "Users", badgeClass: "bg-green-100 text-green-800" },
    {
      key: "moderator",
      label: "Moderators",
      badgeClass: "bg-yellow-100 text-yellow-800",
    },
    {
      key: "fundraiser",
      label: "Fundraisers",
      badgeClass: "bg-orange-100 text-orange-800",
    },
    {
      key: "admin",
      label: "Admins",
      badgeClass: "bg-purple-100 text-purple-800",
    },
  ];

  const filteredUsers = users.filter((u) => u.role === selectedRole);
  const currentRoleOption = roleOptions.find((r) => r.key === selectedRole);

  const sidebarItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "users", label: "Users", icon: Users },
    { key: "campaigns", label: "Campaigns", icon: Megaphone },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  // Shared sidebar nav content
  const SidebarNav = () => (
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

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
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
            <SidebarNav />
          </div>
        </div>
      )}

      {/* --- DESKTOP SIDEBAR (always visible on md+) --- */}
      <div className="hidden md:flex md:shrink-0">
        <div className="flex flex-col w-64 bg-indigo-900">
          <SidebarNav />
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* --- TOP HEADER BAR --- */}
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
                Admin, {loggedInUser}
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

        {/* --- SCROLLABLE CONTENT --- */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* ===== DASHBOARD VIEW ===== */}
          {activeView === "dashboard" && (
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
                value={campaigns
                  .filter((c) => {
                    const now = new Date();
                    const deadline = new Date(c.deadline);
                    return c.status === "active" && deadline > now;
                  })
                  .length.toLocaleString()}
                icon={Settings}
                colorClass="bg-green-500"
              />
            </div>
          )}

          {/* ===== USERS VIEW ===== */}
          {activeView === "users" && (
            <div>
              {/* Role selector dropdown */}
              <div className="relative inline-block mb-5">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-700">
                    {currentRoleOption.label}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${currentRoleOption.badgeClass}`}
                  >
                    {loading ? "..." : filteredUsers.length}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform ${roleDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    {roleOptions.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setSelectedRole(opt.key);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer
                                                    ${selectedRole === opt.key ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-gray-700"}
                                                    ${opt.key === "user" ? "rounded-t-lg" : ""}
                                                    ${opt.key === "admin" ? "rounded-b-lg" : ""}`}
                      >
                        {opt.label}
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${opt.badgeClass}`}
                        >
                          {loading
                            ? "..."
                            : users.filter((u) => u.role === opt.key).length}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filtered user table */}
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          KYC Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Change Role
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-10 text-center text-gray-500"
                          >
                            <div className="flex justify-center items-center">
                              <svg
                                className="animate-spin h-5 w-5 mr-3 text-indigo-600"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                              </svg>
                              Loading...
                            </div>
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-10 text-center text-red-500"
                          >
                            {error}
                          </td>
                        </tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-10 text-center text-gray-400 text-sm"
                          >
                            No {selectedRole}s found.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user, index) => (
                          <tr
                            key={user.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div
                                  className={`h-9 w-9 rounded-full flex items-center justify-center text-white font-bold text-sm ${avatarColors[index % avatarColors.length]}`}
                                >
                                  {user.name.charAt(0)}
                                </div>
                                <div className="ml-3 text-sm font-medium text-gray-900">
                                  {user.name}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${currentRoleOption.badgeClass}`}
                              >
                                {user.role.charAt(0).toUpperCase() +
                                  user.role.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.kyc_verified
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {user.kyc_verified ? "Verified" : "Unverified"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center relative w-full max-w-45">
                                <Shield className="h-4 w-4 text-gray-400 absolute left-2 pointer-events-none" />
                                <select
                                  value={user.role}
                                  onChange={(e) =>
                                    handleRoleChange(user.id, e.target.value)
                                  }
                                  className="block w-full pl-8 pr-3 py-1.5 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                >
                                  <option value="user">User</option>
                                  <option value="moderator">Moderator</option>
                                  <option value="fundraiser">Fundraiser</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">{filteredUsers.length}</span>{" "}
                    {currentRoleOption.label.toLowerCase()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== CAMPAIGNS VIEW ===== */}
          {activeView === "campaigns" && (
            <div>
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Creator
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Goal Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Raised
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Deadline
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {campaignsLoading ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-6 py-10 text-center text-gray-500"
                          >
                            <div className="flex justify-center items-center">
                              <svg
                                className="animate-spin h-5 w-5 mr-3 text-indigo-600"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                              </svg>
                              Loading campaigns...
                            </div>
                          </td>
                        </tr>
                      ) : campaignsError ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-6 py-10 text-center text-red-500"
                          >
                            {campaignsError}
                          </td>
                        </tr>
                      ) : campaigns.length === 0 ? (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-6 py-10 text-center text-gray-400 text-sm"
                          >
                            No campaigns found.
                          </td>
                        </tr>
                      ) : (
                        campaigns.map((campaign) => (
                          <tr
                            key={campaign.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {campaign.title}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {campaign.owner_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              $
                              {parseFloat(
                                campaign.goal_amount,
                              ).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              $
                              {parseFloat(
                                campaign.current_amount,
                              ).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(campaign.deadline).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  campaign.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : campaign.status === "completed"
                                      ? "bg-blue-100 text-blue-800"
                                      : campaign.status === "closed"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {campaign.status.charAt(0).toUpperCase() +
                                  campaign.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
                  <div className="text-sm text-gray-700">
                    Total{" "}
                    <span className="font-medium">{campaigns.length}</span>{" "}
                    campaigns
                  </div>
                </div>
              </div>
            </div>
          )}
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
