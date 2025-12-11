// Load env based on NODE_ENV
import { config } from "dotenv";

// Load .env.test when running tests, otherwise default to .env
config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : undefined,
});

import { PrismaClient } from "@prisma/client";

// Prevent creating multiple PrismaClients in watch/dev/test environments
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prismaGlobal = globalThis as unknown as typeof global & {
  __prisma?: PrismaClient;
};

const prisma =
  prismaGlobal.__prisma ??
  new PrismaClient({
    // Disable query batching in test environment to prevent transaction issues
    ...(process.env.NODE_ENV === "test"
      ? {
          datasources: {
            db: {
              url: process.env.DATABASE_URL,
            },
          },
        }
      : {}),
  });

if (!prismaGlobal.__prisma) prismaGlobal.__prisma = prisma;

export default prisma;
