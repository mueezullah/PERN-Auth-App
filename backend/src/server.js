import app from "./app.js";
import env from "./config/env.js"; // Updated to map our default export env structure safely
import { initializeDatabaseSchema } from "./dbInit.js";

const startServer = async () => {
  try {
    // Confirm table setups exist locally before opening socket connections
    await initializeDatabaseSchema();
    app.listen(env.PORT, () => {
      console.log(`📡 Server running locally on port ${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to boot local application server:", error);
    process.exit(1);
  }
};

startServer();
