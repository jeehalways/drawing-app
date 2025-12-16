import dotenv from "dotenv";
import fs from "fs";

// Only load .env files if they actually exist
if (process.env.NODE_ENV !== "production") {
  const envFile = process.env.NODE_ENV === "test" ? ".env.test" : ".env";

  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile });
  }
}

console.log("🌍 env-loader loaded");
console.log("🌱 NODE_ENV:", process.env.NODE_ENV);
console.log("🗄️ DATABASE_URL:", process.env.DATABASE_URL);
