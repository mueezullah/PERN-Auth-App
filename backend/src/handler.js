import serverless from "serverless-http";
import app from "./app.js";
import { initializeDatabaseSchema } from "./dbInit.js";

// Initialize tables once outside the handler loop (Warm Lambda Optimization)
initializeDatabaseSchema().catch((err) => {
    console.error("Serverless execution environment cold start initialization error:", err);
});

export const handler = serverless(app);