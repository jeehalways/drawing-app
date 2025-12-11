import request from "supertest";
import app from "../src/app";
import { resetDatabase, createAdminToken } from "./test-utils";
import prisma from "../src/config/db";

jest.mock("firebase-admin", () => {
  const authMock = {
    verifyIdToken: jest.fn((token: string) => {
      if (token === "admin-token")
        return Promise.resolve({ uid: "admin-uid", admin: true });
      return Promise.reject(new Error("Invalid token"));
    }),
  };
  return {
    initializeApp: jest.fn(),
    auth: () => authMock,
    credential: { cert: jest.fn() },
  };
});

describe("Admin Drawings API", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("GET /api/admin/drawings returns list for admin", async () => {
    // Use await to ensure user is created before drawing
    const user = await prisma.user.create({
      data: {
        name: "AdminUser",
        birthday: new Date(),
        avatar: null,
      },
    });

    // Verify user was created
    const userCheck = await prisma.user.findUnique({ where: { id: user.id } });
    expect(userCheck).toBeTruthy();

    const drawing = await prisma.drawing.create({
      data: { userId: user.id, imageData: "img" },
    });

    const res = await request(app)
      .get("/api/admin/drawings")
      .set("Authorization", `Bearer ${createAdminToken()}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].user.id).toBe(user.id);
  });

  test("DELETE /api/admin/drawings/:id deletes drawing", async () => {
    const user = await prisma.user.create({
      data: {
        name: "AdminUser",
        birthday: new Date(),
        avatar: null,
      },
    });

    // Verify user exists
    const userCheck = await prisma.user.findUnique({ where: { id: user.id } });
    expect(userCheck).toBeTruthy();

    const drawing = await prisma.drawing.create({
      data: { userId: user.id, imageData: "img" },
    });

    const res = await request(app)
      .delete(`/api/admin/drawings/${drawing.id}`)
      .set("Authorization", `Bearer ${createAdminToken()}`);

    expect(res.status).toBe(200);

    const remaining = await prisma.drawing.findMany();
    expect(remaining.length).toBe(0);
  });

  test("DELETE returns 404 for missing drawing", async () => {
    const res = await request(app)
      .delete(`/api/admin/drawings/nonexistent-id`)
      .set("Authorization", `Bearer ${createAdminToken()}`);

    expect(res.status).toBe(404);
  });
});
