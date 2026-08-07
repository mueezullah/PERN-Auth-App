import prisma from "./config/prisma.js";

export const initializeDatabaseSchema = async () => {
    try {
        await prisma.$connect();
        console.log("🚀 Prisma database connection verified and schema ready");
    } catch (err) {
        console.error("❌ Critical: Failed to initialize database via Prisma:", err);
        throw err;
    }
};