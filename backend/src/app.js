import express from "express";
import cors from "cors";
import routes from "./routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Global request pipeline parsing and security middlewares
app.use(express.json());
app.use(cors());

// mount all routes
app.use(routes);

// Global error handler (must be after routes)
app.use(errorHandler);

export default app;
