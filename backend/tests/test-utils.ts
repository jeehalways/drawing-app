// Reset the test database before each test
import prisma from "../src/config/db";

/**
 * Delete children (drawings) first, then users.
 * This prevents foreign-key constraint problems during resets.
 */
export async function resetDatabase() {
  // Delete in correct order to avoid FK constraint issues
  const drawings = await prisma.drawing.deleteMany({});
  const users = await prisma.user.deleteMany({});

  // Ensure the deletes are complete
  return { drawings, users };
}

// Simple token helpers used by tests and firebase mock.
export function createAdminToken() {
  return "admin-token";
}

export function createUserToken() {
  return "user-token";
}

// Clean disconnect helper for globalTeardown or afterAll
export async function disconnectPrisma() {
  await prisma.$disconnect();
}
