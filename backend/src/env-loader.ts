import dotenv from "dotenv";

// Always load the correct env BEFORE anything else
dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
});

console.log("🌍 env-loader loaded");
console.log("🌱 NODE_ENV:", process.env.NODE_ENV);
console.log("🗄️ DATABASE_URL:", process.env.DATABASE_URL);
