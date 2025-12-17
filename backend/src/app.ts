import express from "express";
import cors from "cors";
import logger from "./config/logger";
import healthRouter from "./routes/health";
import registerRouter from "./routes/register";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./docs/swagger";
import drawingsRouter from "./routes/drawings";
import adminRouter from "./routes/admin";
import registerFirebaseRouter from "./routes/registerFirebase";

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:3000",
        "https://drawing-app-project.netlify.app",
      ];

      // allow server-to-server & tools like curl/postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

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
app.use("/api/register/firebase", registerFirebaseRouter);

export default app;
