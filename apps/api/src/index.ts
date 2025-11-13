import { PrismaClient } from '@prisma/client';
import { WATCH_STATUS_ORDER, formatDate } from '@infocus/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('InFocus API - Starting up...');
  console.log('Prisma Client initialized successfully');
  console.log('Supported watch statuses:', WATCH_STATUS_ORDER.join(', '));
  console.log('Current date:', formatDate(new Date()));
}

main()
  .then(async () => {
    console.log('Application started');
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Application error:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
