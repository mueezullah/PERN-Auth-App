import React from "react";
import { ChevronDown, ChevronRight, Shield } from "lucide-react";

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

export default AccordionItem;
