import prisma from "../src/config/db";

export default async function teardown() {
  await prisma.$disconnect();
}
