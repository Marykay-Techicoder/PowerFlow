import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function run() {
  await prisma.user.delete({ where: { email: "admin@powerflow.ng" } }).catch(() => console.log("User not found, proceeding."));
  console.log("Cleaned up.");
  await prisma.$disconnect();
}
run();
