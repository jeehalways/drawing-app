import request from "supertest";
import app from "../src/app";
import { resetDatabase } from "./test-utils";
import prisma from "../src/config/db";

describe("GET /api/register/:id (user fetch)", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("returns 404 for unknown user", async () => {
    const res = await request(app).get(
      "/api/register/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
    );
    expect(res.status).toBe(404);
  });

  test("returns user info for existing user", async () => {
    const user = await prisma.user.create({
      data: {
        name: "UserX",
        birthday: new Date(),
        avatar: null,
      },
    });

    // Verify user exists in database
    const dbCheck = await prisma.user.findUnique({
      where: { id: user.id },
    });
    expect(dbCheck).toBeTruthy();
    expect(dbCheck?.name).toBe("UserX");

    const res = await request(app).get(`/api/register/${user.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(user.id);
    expect(res.body.name).toBe("UserX");
  });
});
