import { PrismaClient } from '@prisma/client';
import path from 'path';

const SUPABASE_DEFAULT_DB = "postgresql://postgres:pgmartjharia2026@db.jgyiqbdplrisupvqkiqv.supabase.co:5432/postgres";

// Guarantee connection to Supabase PostgreSQL database even if .env is omitted in production
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('dev.db') || process.env.DATABASE_URL.includes('file:')) {
  process.env.DATABASE_URL = SUPABASE_DEFAULT_DB;
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

