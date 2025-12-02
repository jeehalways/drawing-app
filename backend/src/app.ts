import express from "express";
import cors from "cors";
import logger from "./config/logger";
import healthRouter from "./routes/health";
import registerRouter from "./routes/register";

const app = express();

app.use(cors());
app.use(express.json());

// simple request log middleware
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use("/api/health", healthRouter);
app.use("/api/register", registerRouter);

export default app;
