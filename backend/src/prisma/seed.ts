import prisma from './client';

async function seed() {
  console.log('🌱 Seeding database...');

  // Create admin user (your Telegram ID)
  const admin = await prisma.user.upsert({
    where: { telegramId: '248329110' },
    update: {},
    create: {
      telegramId: '248329110',
      username: 'vadym',
      firstName: 'Вадим',
      lastName: 'Волков',
      role: 'ADMIN',
    },
  });

  // Create test student
  const student = await prisma.user.upsert({
    where: { telegramId: '000000002' },
    update: {},
    create: {
      telegramId: '000000002',
      username: 'student1',
      firstName: 'Иван',
      lastName: 'Петров',
      role: 'STUDENT',
    },
  });

  // Create package for student
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 3);

  const pkg = await prisma.package.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Пакет 8 уроков — Ноябрь',
      lessonsTotal: 8,
      lessonsUsed: 2,
      expiresAt,
      studentId: student.id,
    },
  });

  // Create available time slots for the next 2 weeks
  const slotsToCreate = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    slotsToCreate.push(
      { date, startTime: '10:00', endTime: '11:00', adminId: admin.id },
      { date, startTime: '14:00', endTime: '15:00', adminId: admin.id },
      { date, startTime: '18:00', endTime: '19:00', adminId: admin.id },
    );
  }

  await prisma.timeSlot.createMany({ data: slotsToCreate, skipDuplicates: true });

  console.log(`✅ Seeded:`);
  console.log(`   👩‍🏫 Admin: ${admin.firstName} (telegramId: ${admin.telegramId})`);
  console.log(`   👨‍🎓 Student: ${student.firstName} (telegramId: ${student.telegramId})`);
  console.log(`   📦 Package: ${pkg.name}`);
  console.log(`   📅 Time slots: ${slotsToCreate.length} created`);

  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
