import { resolve } from 'node:path';

import {
  config,
} from 'dotenv';

import {
  defineConfig,
  env,
} from 'prisma/config';

const envFile = process.env.NODE_ENV === 'production'
  ? '.env.prod'
  : '.env.dev';

config({
  path: resolve(process.cwd(), envFile),
  override: true,
});

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
