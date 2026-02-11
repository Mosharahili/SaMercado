import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import prisma from '../src/lib/prisma';
import { ALL_PERMISSION_CODES } from '../src/constants/permissions';

async function main() {
  const ownerEmail = 'owner@saudimercado.sa';
  const ownerPassword = 'Owner@123456';

  await prisma.permission.createMany({
    data: ALL_PERMISSION_CODES.map((code) => ({
      code,
      label: code,
    })),
    skipDuplicates: true,
  });

  const ownerHash = await bcrypt.hash(ownerPassword, 10);

  const owner = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {
      role: 'OWNER',
      passwordHash: ownerHash,
      isActive: true,
    },
    create: {
      email: ownerEmail,
      name: 'مالك التطبيق',
      role: 'OWNER',
      passwordHash: ownerHash,
      isActive: true,
    },
  });

  await prisma.userPermission.deleteMany({ where: { userId: owner.id } });

  const permissions = await prisma.permission.findMany({ where: { code: { in: ALL_PERMISSION_CODES } } });
  await prisma.userPermission.createMany({
    data: permissions.map((permission) => ({
      userId: owner.id,
      permissionId: permission.id,
    })),
    skipDuplicates: true,
  });

  await prisma.admin.upsert({
    where: { userId: owner.id },
    update: {},
    create: {
      userId: owner.id,
      createdById: owner.id,
    },
  });

  const categoryData = [
    { nameAr: 'خضار', slug: 'vegetables' },
    { nameAr: 'فواكه', slug: 'fruits' },
    { nameAr: 'تمور', slug: 'dates' },
  ];

  for (const category of categoryData) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { nameAr: category.nameAr },
      create: category,
    });
  }

  const markets = [
    {
      name: 'سوق الخضار المركزي - الرياض',
      region: 'الرياض',
      location: 'العزيزية',
      description: 'أكبر سوق مركزي للخضار والفواكه في الرياض',
      operatingHours: '04:00 ص - 12:00 م',
      priceRange: 'منخفض - متوسط',
    },
    {
      name: 'سوق الشمال المركزي',
      region: 'الرياض',
      location: 'الشمال',
      description: 'سوق حديث بجودة عالية وتنوع يومي',
      operatingHours: '05:00 ص - 11:00 م',
      priceRange: 'متوسط',
    },
  ];

  for (const market of markets) {
    const existing = await prisma.market.findFirst({ where: { name: market.name } });
    if (existing) {
      await prisma.market.update({
        where: { id: existing.id },
        data: market,
      });
    } else {
      await prisma.market.create({ data: market });
    }
  }

  await prisma.systemSetting.upsert({
    where: { key: 'branding' },
    update: {
      value: {
        appName: 'سعودي ميركادو SaudiMercado',
        primaryColor: '#22c55e',
        secondaryColor: '#16a34a',
      } as Prisma.JsonObject,
    },
    create: {
      key: 'branding',
      value: {
        appName: 'سعودي ميركادو SaudiMercado',
        primaryColor: '#22c55e',
        secondaryColor: '#16a34a',
      } as Prisma.JsonObject,
      description: 'App branding settings',
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: 'payments' },
    update: {
      value: {
        stcPayEnabled: true,
        madaEnabled: true,
        applePayEnabled: true,
        codEnabled: true,
      } as Prisma.JsonObject,
    },
    create: {
      key: 'payments',
      value: {
        stcPayEnabled: true,
        madaEnabled: true,
        applePayEnabled: true,
        codEnabled: true,
      } as Prisma.JsonObject,
      description: 'Payment configuration',
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: 'fees' },
    update: {
      value: {
        deliveryFee: 15,
        taxRate: 0.15,
      } as Prisma.JsonObject,
    },
    create: {
      key: 'fees',
      value: {
        deliveryFee: 15,
        taxRate: 0.15,
      } as Prisma.JsonObject,
      description: 'Delivery and tax rules',
    },
  });

  console.log('Seed completed');
  console.log(`Owner login: ${ownerEmail} / ${ownerPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
