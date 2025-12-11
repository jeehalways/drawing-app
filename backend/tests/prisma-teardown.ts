import { disconnectPrisma } from "./test-utils";

export default async function teardown() {
  await disconnectPrisma();
}
