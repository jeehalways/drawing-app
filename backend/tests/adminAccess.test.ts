import request from "supertest";
import app from "../src/app";
import { resetDatabase, createAdminToken, createUserToken } from "./test-utils";
import prisma from "../src/config/db";

jest.mock("firebase-admin", () => {
  const authMock = {
    verifyIdToken: jest.fn((token: string) => {
      if (token === "admin-token")
        return Promise.resolve({ uid: "admin-uid", admin: true });
      if (token === "user-token")
        return Promise.resolve({ uid: "user-uid", admin: false });
      return Promise.reject(new Error("Invalid token"));
    }),
  };
  return {
    initializeApp: jest.fn(),
    auth: () => authMock,
    credential: {
      cert: jest.fn(),
    },
  };
});

describe("Admin access control", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("rejects requests without bearer header", async () => {
    const res = await request(app).get("/api/admin/drawings");
    expect(res.status).toBe(401);
  });

  test("rejects non-admin token", async () => {
    const res = await request(app)
      .get("/api/admin/drawings")
      .set("Authorization", `Bearer ${createUserToken()}`);
    expect(res.status).toBe(403);
  });

  test("allows admin user", async () => {
    const res = await request(app)
      .get("/api/admin/drawings")
      .set("Authorization", `Bearer ${createAdminToken()}`);
    // empty list still returns 200
    expect(res.status).toBe(200);
  });
});
