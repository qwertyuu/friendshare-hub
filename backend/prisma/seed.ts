import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { env } from '../src/config/env.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.upsert({
    where: { email: env.ADMIN_EMAIL },
    update: {},
    create: {
      email: env.ADMIN_EMAIL,
      name: 'Admin User',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      status: 'APPROVED',
    },
  });

  console.log(`Admin user created/verified: ${admin.email}`);

  // Create test user
  const testUserPasswordHash = await bcrypt.hash('password123', 10);
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: testUserPasswordHash,
      role: 'USER',
      status: 'APPROVED',
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
