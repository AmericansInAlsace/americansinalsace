import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';

let container: any;

export async function setup() {
  console.log('Starting Postgres container for integration tests...');
  container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('test_db')
    .withUsername('postgres')
    .withPassword('postgres')
    .start();

  const databaseUrl = `postgresql://${container.getUsername()}:${container.getPassword()}@${container.getHost()}:${container.getMappedPort(5432)}/${container.getDatabase()}`;
  process.env.DATABASE_URL = databaseUrl;

  console.log(`Database container started at ${databaseUrl}`);

  // Run migrations
  console.log('Running database migrations...');
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit',
  });
  console.log('Migrations complete.');
}

export async function teardown() {
  if (container) {
    console.log('Stopping Postgres container...');
    await container.stop();
    console.log('Postgres container stopped.');
  }
}
