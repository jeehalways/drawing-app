import dotenv from "dotenv";

const isPrisma =
  process.argv.some((arg) => arg.includes("prisma")) ||
  process.env.PRISMA_GENERATE === "true";

if (!isPrisma && process.env.NODE_ENV !== "production") {
  dotenv.config({
    path: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
  });
}

console.log("🌍 env-loader loaded");
console.log("🌱 NODE_ENV:", process.env.NODE_ENV);
console.log("🗄️ DATABASE_URL:", process.env.DATABASE_URL);
