import dotenv from "dotenv";

// Only load .env files locally or in tests
if (process.env.NODE_ENV !== "production") {
  dotenv.config({
    path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
  });
}

console.log("🌍 env-loader loaded");
console.log("🌱 NODE_ENV:", process.env.NODE_ENV);
console.log("🗄️ DATABASE_URL:", process.env.DATABASE_URL);
