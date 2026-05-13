import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MessageCircle,
  PlusSquare,
  Bell,
  User,
  Menu,
  X,
  Shirt,
  FileText,
  Trophy,
  CircleDollarSign,
  Shield,
  ToggleLeft,
  LogOut,
  Settings as SettingsIcon,
  Edit3,
  Megaphone,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { CreateThreadModal } from "./CreateThreadModal";
import { Link } from "react-router-dom";

export function Navbar({
  setIsAuthenticated,
}: {
  setIsAuthenticated?: (value: boolean) => void;
}) {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const [isThreadModalOpen, setIsThreadModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const createDropdownRef = useRef<HTMLDivElement>(null);

  const role = localStorage.getItem("role");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
      if (
        createDropdownRef.current &&
        !createDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCreateDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("role");
    if (setIsAuthenticated) setIsAuthenticated(false);
    navigate("/");
  };

  const handleCampaignClick = () => {
    setIsCreateDropdownOpen(false);
    if (role === "fundraiser" || role === "admin") {
      navigate("/create-campaign");
    } else {
      // 'user' role must complete KYC before creating campaigns
      navigate("/kyc-verification");
    }
  };

  const handlePostClick = () => {
    setIsCreateDropdownOpen(false);
    setIsThreadModalOpen(true);
  };

  const profileMenuItems = [
    {
      label: "View Profile",
      icon: User,
      action: () => {
        setIsProfileDropdownOpen(false);
        const username = localStorage.getItem("loggedInUser") || "WizardX";
        navigate(`/user/${username}`);
      },
    },
    { label: "Edit Avatar", icon: Shirt },
    { label: "Drafts", icon: FileText },
    { label: "Achievements", icon: Trophy },
    { label: "Campaigns", icon: CircleDollarSign },
    { label: "Premium", icon: Shield },
    { label: "Display Mode", icon: ToggleLeft },
    { label: "Settings", icon: SettingsIcon },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md z-50 px-4 md:px-8 flex items-center border-b border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <button
          className="lg:hidden p-2 -ml-2 mr-2 text-slate-600 hover:text-slate-900 transition-colors"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="shrink-0 w-auto md:w-64 text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 flex items-center">
          <Link to="/feed">
            FUNDME<span className="text-indigo-600">.</span>
          </Link>
        </div>

        <div className="flex-1 flex justify-center px-4">
          <div className="relative items-center w-full max-w-xl hidden sm:flex group">
            <input
              type="text"
              placeholder="Search campaigns, posts, and people..."
              className="w-full h-10 pl-11 pr-4 bg-slate-100/80 rounded-full text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 border border-transparent focus:border-indigo-500/30 focus:bg-white transition-all shadow-inner"
            />
            <Search className="absolute left-4 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none" />
          </div>
          <button className="sm:hidden p-2 text-slate-600 ml-auto">
            <Search className="w-5 h-5" />
          </button>
        </div>

        <div className="shrink-0 flex justify-end items-center space-x-2 md:space-x-5 text-slate-600">
          <button className="p-2 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors hidden sm:block">
            <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* Create Dropdown */}
          <div className="relative" ref={createDropdownRef}>
            <button
              onClick={() => setIsCreateDropdownOpen(!isCreateDropdownOpen)}
              className="flex items-center space-x-1.5 font-semibold text-slate-700 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-full hover:bg-indigo-50"
            >
              <PlusSquare className="w-5 h-5 md:w-6 md:h-6" />
              <span className="hidden md:inline text-sm">Create</span>
            </button>

            {isCreateDropdownOpen && (
              <div className="absolute top-full right-0 mt-3 w-60 bg-[#1a1a1b] border border-slate-700/50 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col z-50 py-2 text-[#d7dadc]">
                <button
                  onClick={handlePostClick}
                  className="flex cursor-pointer items-center px-4 py-3 hover:bg-[#272729] transition-colors w-full text-left"
                >
                  <Edit3
                    className="w-5.5 h-5.5 mr-3 text-[#d7dadc]"
                    strokeWidth={1.5}
                  />
                  <div>
                    <span className="text-[14px] font-medium block">
                      Post / Thread
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Share with the community
                    </span>
                  </div>
                </button>

                <div className="h-px bg-[#343536] w-full" />

                <button
                  onClick={handleCampaignClick}
                  className="flex cursor-pointer items-center px-4 py-3 hover:bg-[#272729] transition-colors w-full text-left"
                >
                  <Megaphone
                    className="w-5.5 h-5.5 mr-3 text-[#d7dadc]"
                    strokeWidth={1.5}
                  />
                  <div>
                    <span className="text-[14px] font-medium block">
                      Campaign
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {role === "fundraiser" || role === "admin"
                        ? "Start a fundraising campaign"
                        : "Requires verified account"}
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button className="p-2 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors relative">
            <Bell className="w-5 h-5 md:w-6 md:h-6" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="relative hidden sm:block" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="hover:ring-2 hover:ring-indigo-500/30 transition-all overflow-hidden rounded-full border border-slate-200 block"
            >
              <User className="w-7 h-7 md:w-9 md:h-9 text-slate-500 bg-slate-100 p-1.5 rounded-full cursor-pointer" />
            </button>
            {isProfileDropdownOpen && (
              <div className="absolute top-full right-0 mt-3 w-64 bg-[#1a1a1b] border border-slate-700/50 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col z-50 py-2 text-[#d7dadc]">
                {profileMenuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="flex cursor-pointer items-center px-4 py-3 hover:bg-[#272729] transition-colors w-full text-left"
                  >
                    <item.icon
                      className="w-5.5 h-5.5 mr-3 text-[#d7dadc]"
                      strokeWidth={1.5}
                    />
                    <span className="text-[14px] font-medium">
                      {item.label}
                    </span>
                  </button>
                ))}

                <div className="h-px bg-[#343536] w-full my-1" />

                <button
                  onClick={handleLogout}
                  className="flex cursor-pointer items-center px-4 py-3 hover:bg-[#272729] transition-colors w-full text-left"
                >
                  <LogOut
                    className="w-5.5 h-5.5 mr-3 text-[#d7dadc]"
                    strokeWidth={1.5}
                  />
                  <span className="text-[14px] font-medium">Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-60 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative flex flex-col w-70 max-w-sm bg-white h-full shadow-2xl z-10 transition-transform duration-300 transform translate-x-0">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Menu
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-slate-50/50">
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      {/* Thread / Post Modal — available to all roles */}
      <CreateThreadModal
        isOpen={isThreadModalOpen}
        onClose={() => setIsThreadModalOpen(false)}
      />
    </>
  );
}
