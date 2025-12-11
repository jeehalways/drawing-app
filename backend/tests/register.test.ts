import request from "supertest";
import app from "../src/app";
import { resetDatabase } from "./test-utils";
import prisma from "../src/config/db";

describe("POST /api/register", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("creates a user with valid name + birthday", async () => {
    const res = await request(app).post("/api/register").send({
      name: "Tester",
      birthday: "1990-01-01",
    });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();

    // Add a small delay to ensure transaction is committed
    await new Promise((resolve) => setTimeout(resolve, 50));

    const dbUser = await prisma.user.findUnique({ where: { id: res.body.id } });
    expect(dbUser).toBeTruthy();
    expect(dbUser!.name).toBe("Tester");
  });

  test("returns 400 if name is missing", async () => {
    const res = await request(app).post("/api/register").send({
      name: "",
      birthday: "1990-01-01",
    });

    expect(res.status).toBe(400);
  });

  test("returns 400 if birthday is missing", async () => {
    const res = await request(app).post("/api/register").send({
      name: "Tester",
    });

    expect(res.status).toBe(400);
  });

  test("stores correct birthday in DB", async () => {
    const res = await request(app).post("/api/register").send({
      name: "BirthdayTest",
      birthday: "2000-05-03",
    });

    expect(res.status).toBe(201);

    // Add a small delay to ensure transaction is committed
    await new Promise((resolve) => setTimeout(resolve, 50));

    const dbUser = await prisma.user.findUnique({ where: { id: res.body.id } });
    expect(dbUser).toBeTruthy();
    expect(dbUser!.birthday?.toISOString().startsWith("2000-05-03")).toBe(true);
  });
});
