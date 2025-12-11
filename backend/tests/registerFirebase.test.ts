import request from "supertest";
import app from "../src/app";
import { resetDatabase } from "./test-utils";
import prisma from "../src/config/db";

/**
 * Mock firebase-admin with verifyIdToken
 * - "valid-token" resolves with uid/email/name
 * - anything else rejects
 */
jest.mock("firebase-admin", () => {
  const authMock = {
    verifyIdToken: jest.fn((token: string) => {
      if (token === "valid-token")
        return Promise.resolve({
          uid: "firebase-uid-1",
          email: "test@example.com",
          name: "Firebase Tester",
        });

      if (token === "valid-existing") {
        return Promise.resolve({
          uid: "firebase-uid-2",
          email: "exists@example.com",
          name: "Existing",
        });
      }

      return Promise.reject(new Error("Invalid token"));
    }),
  };

  return {
    initializeApp: jest.fn(),
    auth: () => authMock,
    credential: { cert: jest.fn() },
  };
});

describe("POST /api/register/firebase", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("creates a new user when token is valid", async () => {
    const res = await request(app).post("/api/register/firebase").send({
      token: "valid-token",
    });

    expect(res.status).toBe(200);
    expect(res.body.userId).toBeDefined();

    const user = await prisma.user.findUnique({
      where: { id: res.body.userId },
    });
    expect(user).toBeTruthy();
    expect(user!.email).toBe("test@example.com");
  });

  test("does NOT create duplicate if email exists", async () => {
    // create existing user with same email
    const existing = await prisma.user.create({
      data: {
        name: "Exists",
        email: "exists@example.com",
        birthday: null,
        avatar: null,
      },
    });

    // Verify the user was actually created
    const verifyUser = await prisma.user.findUnique({
      where: { id: existing.id },
    });
    expect(verifyUser).toBeTruthy();
    expect(verifyUser?.email).toBe("exists@example.com");

    const res = await request(app).post("/api/register/firebase").send({
      token: "valid-existing",
    });

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(existing.id);

    const users = await prisma.user.findMany({
      where: { email: "exists@example.com" },
    });
    expect(users.length).toBe(1);
  });

  test("returns 401 for invalid token", async () => {
    const res = await request(app).post("/api/register/firebase").send({
      token: "invalid",
    });

    expect(res.status).toBe(401);
  });
});
