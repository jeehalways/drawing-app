import request from "supertest";
import app from "../src/app";
import { resetDatabase } from "./test-utils";
import prisma from "../src/config/db";

describe("Drawings API", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("POST /api/drawings creates drawing", async () => {
    const user = await prisma.user.create({
      data: {
        name: "Drawer",
        birthday: new Date("1999-01-01"),
        avatar: null,
      },
    });

    // Verify user exists before making request
    const userCheck = await prisma.user.findUnique({ where: { id: user.id } });
    expect(userCheck).toBeTruthy();
    expect(userCheck?.id).toBe(user.id);

    const res = await request(app).post("/api/drawings").send({
      userId: user.id,
      imageData: "data:image/png;base64,AAA",
    });

    // Log response for debugging if it fails
    if (res.status !== 201) {
      console.log("Response body:", res.body);
    }

    expect(res.status).toBe(201);
    expect(res.body.userId).toBe(user.id);

    const drawings = await prisma.drawing.findMany({
      where: { userId: user.id },
    });
    expect(drawings.length).toBe(1);
  });

  test("POST /api/drawings returns 400 when imageData is missing", async () => {
    const res = await request(app).post("/api/drawings").send({
      userId: "some-user-id",
    });

    expect(res.status).toBe(400);
  });
});
