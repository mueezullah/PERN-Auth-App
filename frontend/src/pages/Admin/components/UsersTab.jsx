import React, { useState } from "react";
import { Shield, ChevronDown } from "lucide-react";

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

const UsersTab = ({ users, loading, error, handleRoleChange }) => {
  const [selectedRole, setSelectedRole] = useState("user");
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const filteredUsers = users.filter((u) => u.role === selectedRole);
  const currentRoleOption = roleOptions.find((r) => r.key === selectedRole);

  return (
    <div>
      {/* Role selector dropdown */}
      <div className="relative inline-block mb-5">
        <button
          onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <Shield className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-700">
            {currentRoleOption ? currentRoleOption.label : "Users"}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              currentRoleOption ? currentRoleOption.badgeClass : "bg-green-100 text-green-800"
            }`}
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
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          currentRoleOption ? currentRoleOption.badgeClass : "bg-green-100 text-green-800"
                        }`}
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
            {currentRoleOption ? currentRoleOption.label.toLowerCase() : "users"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersTab;
