import express from "express";
import cors from "cors";
import logger from "./config/logger";
import healthRouter from "./routes/health";
import registerRouter from "./routes/register";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./docs/swagger";
import drawingsRouter from "./routes/drawings";
import adminRouter from "./routes/admin";



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
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/drawings", drawingsRouter);
app.use("/api/admin", adminRouter);


export default app;
