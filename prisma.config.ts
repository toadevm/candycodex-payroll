import { config as dotenvConfig } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load .env.local file
dotenvConfig({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
