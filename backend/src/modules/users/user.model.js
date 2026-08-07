import prisma from "../../config/prisma.js";

// User Schema Structure reference
export const UserSchema = {
  id: "SERIAL PRIMARY KEY",
  name: "VARCHAR(255) NOT NULL",
  username: "VARCHAR(20) UNIQUE NOT NULL",
  email: "VARCHAR(255) UNIQUE NOT NULL",
  password: "VARCHAR(255) NOT NULL",
  role: "VARCHAR(20) NOT NULL DEFAULT 'user'",
  kyc_verified: "BOOLEAN DEFAULT FALSE",
  created_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
};

export const initializeTable = async () => {
  // Database tables managed by Prisma Schema/Migrations
  console.log("Users table verified via Prisma");
};

// User Model operations using Prisma Client

export const create = async (name, username, email, password) => {
  return await prisma.user.create({
    data: {
      name,
      username,
      email,
      password,
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      kyc_verified: true,
      created_at: true,
    },
  });
};

export const findByUsername = async (username) => {
  return await prisma.user.findUnique({
    where: { username },
  });
};

export const getPostCountByUserId = async (userId) => {
  return await prisma.post.count({
    where: {
      user_id: parseInt(userId, 10),
      status: "active",
    },
  });
};

export const getCampaignCountByUserId = async (userId) => {
  return await prisma.campaign.count({
    where: {
      user_id: parseInt(userId, 10),
    },
  });
};

export const getBackedProjectsCountByUserId = async (userId) => {
  const result = await prisma.donation.groupBy({
    by: ["campaign_id"],
    where: {
      donor_id: parseInt(userId, 10),
      status: "completed",
    },
  });
  return result.length;
};

export const getTotalContributedByUserId = async (userId) => {
  const aggregate = await prisma.donation.aggregate({
    _sum: {
      amount: true,
    },
    where: {
      donor_id: parseInt(userId, 10),
      status: "completed",
    },
  });
  return aggregate._sum.amount ? Number(aggregate._sum.amount) : 0;
};

export const findByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const findById = async (id) => {
  return await prisma.user.findUnique({
    where: { id: parseInt(id, 10) },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      kyc_verified: true,
      created_at: true,
    },
  });
};

export const findAll = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      kyc_verified: true,
      created_at: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });
};

export const update = async (
  id,
  {
    name = null,
    username = null,
    email = null,
    role = null,
    kyc_verified = null,
  } = {},
) => {
  const updateData = {};
  if (name !== null) updateData.name = name;
  if (username !== null) updateData.username = username;
  if (email !== null) updateData.email = email;
  if (role !== null) updateData.role = role;
  if (kyc_verified !== null) updateData.kyc_verified = kyc_verified;

  return await prisma.user.update({
    where: { id: parseInt(id, 10) },
    data: updateData,
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
      kyc_verified: true,
      created_at: true,
    },
  });
};

export const updatePassword = async (id, newPassword) => {
  await prisma.user.update({
    where: { id: parseInt(id, 10) },
    data: { password: newPassword },
  });
  return true;
};

export const deleteUserRecord = async (id) => {
  return await prisma.user.delete({
    where: { id: parseInt(id, 10) },
    select: { id: true },
  });
};
