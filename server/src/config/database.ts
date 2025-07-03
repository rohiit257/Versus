import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient({
    log:["query", "info", "warn", "error"],
    errorformat: 'pretty',
})

export default prisma;