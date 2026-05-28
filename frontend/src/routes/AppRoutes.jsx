import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Route Guards
import {
  PrivateRoute,
  PublicRoute,
  RoleRoute,
} from "../components/RouteGuards";

// Pages
import Login from "../pages/Auth/Login";
import Signup from "../pages/Auth/Signup";
import Feed from "../pages/Feed/FeedMain";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import Landing from "../pages/Home/LandingMain";
import CreateCampaignModal from "../pages/CreatorDashboard/CreateCampaignModal";
import Campaigns from "../pages/CreatorDashboard/Campaigns";
import { RootLayout as ProfileRootLayout } from "../pages/Profile/RootLayout";
import { ProfileView } from "../pages/Profile/ProfileView";
import KYCVerification from "../pages/KYC/KYCVerification";

const AppRoutes = ({ isAuthenticated, setIsAuthenticated, isLoading }) => {
  
  // Get auth details directly from localStorage
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  // isAuthSync ensures both state and token exist
  const isAuthSync = isAuthenticated && !!token;

  // Default redirect based on role
  const defaultTarget =
    role === "admin" ? "/admin/dashboard" : (role === "user" || role === "fundraiser") ? "/feed" : "/";

  return (
    <Routes>
      
      {/* Default redirect and Landing Page with nested auth modals */}
      <Route
        path="/"
        element={
          isAuthSync ? (
            <Navigate to={defaultTarget} /> // If authenticated, redirect to role-based default
          ) : (
            <Landing isAuthenticated={isAuthSync} /> // If not authenticated, show landing page
          )
        }
      >
        {/* Public routes — display as modals over the landing page */}
        <Route
          path="login"
          element={
            <PublicRoute
              element={<Login isAuthenticated={isAuthenticated} />}
              isAuthenticated={isAuthenticated}
              isLoading={isLoading}
            />
          }
        />
        <Route
          path="signup"
          element={
            <PublicRoute
              element={<Signup setIsAuthenticated={setIsAuthenticated} />}
              isAuthenticated={isAuthenticated}
              isLoading={isLoading}
            />
          }
        />
      </Route>

      {/* Private routes — any authenticated user */}
      <Route
        path="/feed"
        element={
          <PrivateRoute
            element={<Feed setIsAuthenticated={setIsAuthenticated} />}
            isAuthenticated={isAuthenticated}
            isLoading={isLoading}
          />
        }
      />

      {/* User Profiles */}
      <Route
        path="/user"
        element={
          <PrivateRoute
            element={<ProfileRootLayout />}
            isAuthenticated={isAuthenticated}
            isLoading={isLoading}
          />
        }
      >
        <Route path=":username" element={<ProfileView />} />
      </Route>

      {/* Role-restricted routes */}
      <Route
        path="/admin/dashboard"
        element={
          <RoleRoute
            element={<AdminDashboard setIsAuthenticated={setIsAuthenticated} />}
            allowedRoles={["admin"]}
            isAuthenticated={isAuthenticated}
            isLoading={isLoading}
          />
        }
      />

      {/* Create Campaign — fundraiser & admin only */}
      <Route
        path="/create-campaign"
        element={
          <RoleRoute
            element={<CreateCampaignModal />}
            allowedRoles={["fundraiser", "admin"]}
            isAuthenticated={isAuthenticated}
            isLoading={isLoading}
          />
        }
      />

      {/* Creator Dashboard — fundraiser & admin only */}
      <Route
        path="/creator/dashboard"
        element={
          <RoleRoute
            element={<Campaigns />}
            allowedRoles={["fundraiser", "admin"]}
            isAuthenticated={isAuthenticated}
            isLoading={isLoading}
          />
        }
      />

      {/* KYC Verification — for 'user' role (all auth users can access) */}
      <Route
        path="/kyc-verification"
        element={
          <PrivateRoute
            element={<KYCVerification />}
            isAuthenticated={isAuthenticated}
            isLoading={isLoading}
          />
        }
      />

      {/*
        To add more role-restricted routes in the future:

        <Route
          path="/moderatorPanel"
          element={
            <RoleRoute
              element={<ModeratorPanel />}
              allowedRoles={["admin", "moderator"]}
              isAuthenticated={isAuthenticated}
              isLoading={isLoading}
            />
          }
        />
      */}
    </Routes>
  );
};

export default AppRoutes;
