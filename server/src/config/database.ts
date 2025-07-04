import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"],
    errorFormat: 'pretty', // Note: should be 'errorFormat' (capital F)
});

export default prisma;