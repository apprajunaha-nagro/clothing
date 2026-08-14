import { PrismaClient } from '@prisma/client';
import path from 'path';

// If DATABASE_URL is not set or relative, resolve to absolute path
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${path.join(process.cwd(), 'prisma', 'dev.db')}`;
} else if (process.env.DATABASE_URL.startsWith('file:.') && !process.env.DATABASE_URL.startsWith('file:/') && !process.env.DATABASE_URL.includes(':')) {
  const relativeDb = process.env.DATABASE_URL.replace(/^file:/, '');
  process.env.DATABASE_URL = `file:${path.resolve(process.cwd(), relativeDb)}`;
}

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

let prismaInstance: PrismaClient;

try {
  prismaInstance =
    globalThis.prismaGlobal ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

  if (process.env.NODE_ENV !== 'production') {
    globalThis.prismaGlobal = prismaInstance;
  }
} catch (err) {
  console.warn('PrismaClient initialization fallback mode:', err);
  prismaInstance = new Proxy({} as PrismaClient, {
    get(_target, prop) {
      return new Proxy(() => {}, {
        get() {
          return () => Promise.resolve(null);
        },
        apply() {
          return Promise.resolve(null);
        }
      });
    }
  });
}

export const prisma = prismaInstance;
export default prisma;

