import * as UserModel from "../users/user.model.js";
import { hashPassword, comparePassword } from "../../utils/hash.js";
import { generateToken } from "../../utils/jwt.js";

export const signupUser = async (name, username, email, password) => {
  const existingUserEmail = await UserModel.findByEmail(email);
  if (existingUserEmail) {
    return { success: false, status: 409, message: "Email already exists" };
  }
  const existingUsername = await UserModel.findByUsername(username);
  if (existingUsername) {
    return { success: false, status: 409, message: "Username is already taken" };
  }

  const hashedPassword = await hashPassword(password);
  const newUser = await UserModel.create(name, username, email, hashedPassword);

  // Default to 'user' role if undefined for some reason
  const role = newUser.role || "user";
  const kyc_verified = newUser.kyc_verified || false;

  const jwtToken = generateToken({
    email: newUser.email,
    id: newUser.id,
    role,
    kyc_verified,
  });

  // Determine redirection path based on role
  const redirectTo = role === "admin" ? "/admin/dashboard" : "/feed";

  return {
    success: true,
    status: 201,
    data: {
      message: "User registered successfully",
      success: true,
      jwtToken,
      email: newUser.email,
      name: newUser.name,
      username: newUser.username,
      role,
      avatar: newUser.avatar_url || "",
      kyc_verified,
      id: newUser.id,
      redirectTo,
    },
  };
};

export const loginUser = async (email, password) => {
  const user = await UserModel.findByEmail(email);
  const errorMessage =
    "Authentication failed, Email or password is incorrect";

  if (!user) {
    return { success: false, status: 401, message: errorMessage };
  }

  const isPassEqual = await comparePassword(password, user.password);
  if (!isPassEqual) {
    return { success: false, status: 401, message: errorMessage };
  }

  const jwtToken = generateToken({
    email: user.email,
    id: user.id,
    role: user.role,
    kyc_verified: user.kyc_verified,
  });

  // Determine redirection path based on role
  const redirectTo =
    user.role === "admin"
      ? "/admin/dashboard"
      : user.role === "user"
        ? "/feed"
        : "/";

  return {
    success: true,
    status: 200,
    data: {
      message: "Login success",
      success: true,
      jwtToken,
      email,
      name: user.name,
      username: user.username,
      role: user.role,
      avatar: user.avatar_url || "",
      kyc_verified: user.kyc_verified,
      id: user.id,
      redirectTo,
    },
  };
};

export const fetchAllUsers = async () => {
  const users = await UserModel.findAll();
  return {
    success: true,
    users,
    totalUsers: users.length,
  };
};

export const updateUserRole = async (userId, newRole) => {
  const allowedRoles = ["user", "moderator", "fundraiser", "admin"];
  if (!allowedRoles.includes(newRole)) {
    return { success: false, status: 400, message: "Invalid role value" };
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    return { success: false, status: 404, message: "User not found" };
  }

  if (newRole === "fundraiser" && !user.kyc_verified) {
    return {
      success: false,
      status: 400,
      message: "Only KYC verified users can be assigned the 'fundraiser' role",
    };
  }

  const updatedUser = await UserModel.update(userId, { role: newRole });
  return {
    success: true,
    status: 200,
    data: {
      message: "Role updated successfully",
      user: updatedUser,
    },
  };
};

export const toggleKycStatus = async (userId, kycVerified) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    return { success: false, status: 404, message: "User not found" };
  }

  let roleToUpdate = null;
  // If user is being unverified and they are a fundraiser, demote them to user
  if (!kycVerified && user.role === "fundraiser") {
    roleToUpdate = "user";
  }

  const updatedUser = await UserModel.update(userId, { role: roleToUpdate, kyc_verified: kycVerified });
  return {
    success: true,
    status: 200,
    data: {
      message: "KYC verification status updated successfully",
      user: updatedUser,
    },
  };
};

