import process from 'node:process';

import {
  PrismaPg,
} from '@prisma/adapter-pg';

import {
  PrismaClient,
} from '../generated/prisma/client';

const globalForDatabase = globalThis as typeof globalThis & {
  prismaClient?: PrismaClient;
};

// DB는 데이터베이스 접근 진입점으로만 사용한다.
export class DB {
  private static getClient(): PrismaClient {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not set.');
    }

    const adapter = new PrismaPg({
      connectionString: databaseUrl,
    });
    const prismaClient = globalForDatabase.prismaClient ?? new PrismaClient({
      adapter,
    });

    if (process.env.NODE_ENV !== 'production') {
      globalForDatabase.prismaClient = prismaClient;
    }

    return prismaClient;
  }

  public static users() {
    return this.getClient().user;
  }
}
