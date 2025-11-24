import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma_v1: PrismaClient | undefined;
};

// Use a new key to force a fresh instance after schema update
const prisma = globalForPrisma.prisma_v1 ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma_v1 = prisma;
}

export default prisma;
