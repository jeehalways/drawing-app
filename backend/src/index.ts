import dotenv from "dotenv";

dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});

import app from "./app";
import logger from "./config/logger";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`✅ Server running at http://localhost:${PORT}`);
});
