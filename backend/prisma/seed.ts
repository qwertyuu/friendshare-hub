import { PrismaClient } from '@prisma/client';
import { env } from '../src/config/env.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: env.ADMIN_EMAIL },
    update: {},
    create: {
      email: env.ADMIN_EMAIL,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log(`Admin user created/verified: ${admin.email}`);

  // Create claude-admin test user
  const claudeAdmin = await prisma.user.upsert({
    where: { email: 'claude-admin@example.com' },
    update: {},
    create: {
      email: 'claude-admin@example.com',
      name: 'Claude Admin',
      role: 'ADMIN',
    },
  });

  console.log(`Claude admin user created: ${claudeAdmin.email}`);

  // Create claude-user test user
  const claudeUser = await prisma.user.upsert({
    where: { email: 'claude-user@example.com' },
    update: {},
    create: {
      email: 'claude-user@example.com',
      name: 'Claude User',
      role: 'USER',
    },
  });

  console.log(`Claude user created: ${claudeUser.email}`);

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
    },
  });

  console.log(`Test user created: ${testUser.email}`);

  // Create sample item
  const item = await prisma.item.create({
    data: {
      title: 'Drill Machine',
      description: 'A powerful electric drill machine for home use',
      category: 'TOOLS',
      status: 'AVAILABLE',
      ownerId: testUser.id,
    },
  });

  console.log(`Sample item created: ${item.title}`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
