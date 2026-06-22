import React from "react";
import {
  Home,
  Bookmark,
  Users,
  Megaphone,
  Bell,
  User,
  Hash,
} from "lucide-react";
import { clsx } from "clsx";
import {Link, useLocation} from 'react-router-dom';



export function Sidebar( {onMobileClose}: {onMobileClose?: () => void}) {

  const location = useLocation();
  const currentPath = location.pathname;

  const items = [
    { name: "Home", icon: Home, path: "/feed" },
    { name: "Explore", icon: Hash, path: "/explore" },
    { name: "Bookmarks", icon: Bookmark, path: "/bookmarks" },
    { name: "Communities", icon: Users, path: "/communities" },
    { name: "My Campaigns", icon: Megaphone, path: "/my-campaigns" },
    { name: "Notifications", icon: Bell, path: "/notifications" },
    { name: "Profile", icon: User, path: `/user/${localStorage.getItem('username')}` },
  ];

 return (
    <div className="w-full h-full py-8 pr-2 pl-2">
      <nav className="space-y-1 pb-6">
        {items.map((item) => {
          const isActive = currentPath === item.path || (item.name === 'Profile' && currentPath.startsWith('/user/'));
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onMobileClose}
              className={clsx(
                "flex items-center space-x-4 px-3 py-3.5 rounded-2xl text-[15px] transition-all group",
                isActive
                  ? "bg-white text-indigo-600 shadow-sm border border-slate-200/60 font-semibold"
                  : "text-slate-600 hover:bg-white hover:shadow-sm hover:border hover:border-slate-200/60 hover:text-slate-900 font-medium border border-transparent",
              )}
            >
              <item.icon
                className={clsx(
                  "w-5 h-5 transition-transform group-hover:scale-110",
                  isActive
                    ? "text-indigo-600"
                    : "text-slate-400 group-hover:text-indigo-500",
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
        
      </nav>
    </div>
  );
}