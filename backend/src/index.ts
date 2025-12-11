// LOAD ENVIRONMENT BEFORE ANYTHING ELSE
import "./env-loader";

import app from "./app";
import logger from "./config/logger";

console.log("🚀 Starting backend (after env-loader)...");
console.log("🌱 NODE_ENV:", process.env.NODE_ENV);
console.log("🗄️ DATABASE_URL:", process.env.DATABASE_URL);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}`);
});
