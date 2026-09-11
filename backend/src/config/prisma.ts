import { PrismaClient } from '@prisma/client';

const createPrismaClient = () => {
  const basePrisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

  // Extend with automatic retry on transient pooler connection drop (Os 10054 / ConnectionReset)
  return basePrisma.$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        try {
          return await query(args);
        } catch (error: any) {
          const isConnectionError =
            error?.message?.includes('ConnectionReset') ||
            error?.message?.includes('closed the connection') ||
            error?.message?.includes('10054') ||
            error?.message?.includes('Can\'t reach database server') ||
            error?.code === 'P1001';

          if (isConnectionError) {
            console.warn(`[Prisma Pooler] Transient connection drop on ${model}.${operation}, retrying query...`);
            try {
              await basePrisma.$connect();
            } catch {}
            // Retry once
            return await query(args);
          }
          throw error;
        }
      },
    },
  });
};

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

declare global {
  var prismaGlobal: undefined | ExtendedPrismaClient;
}

export const prisma = globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma as any;
}

