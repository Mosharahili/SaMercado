import { PrismaClient, UserRole, CategoryType, UnitType, BannerPlacement, BannerClickActionType, PopupTargetType, PaymentMethod, PaymentStatus, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Saudi Mercado sample data...");

  // ----- Core users -----
  const owner = await prisma.user.upsert({
    where: { email: "owner@samercado.test" },
    update: { role: UserRole.OWNER, name: "مالك التطبيق" },
    create: {
      email: "owner@samercado.test",
      passwordHash: "$2a$10$CwTycUXWue0Thq9StjUM0uJ8y1oG7F0J9uQ8WcV0u0tADfE8c/9n.", // "password" placeholder
      name: "مالك التطبيق",
      role: UserRole.OWNER,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@samercado.test" },
    update: { name: "عميل تجريبي" },
    create: {
      email: "customer@samercado.test",
      passwordHash: owner.passwordHash,
      name: "عميل تجريبي",
      role: UserRole.CUSTOMER,
    },
  });

  const vendorUser = await prisma.user.upsert({
    where: { email: "vendor@samercado.test" },
    update: { name: "بائع تجريبي", role: UserRole.VENDOR },
    create: {
      email: "vendor@samercado.test",
      passwordHash: owner.passwordHash,
      name: "بائع تجريبي",
      role: UserRole.VENDOR,
    },
  });

  // ----- Categories -----
  if ((await prisma.category.count()) === 0) {
    await prisma.category.createMany({
      data: [
        { name: "خضار", type: CategoryType.VEGETABLE },
        { name: "فواكه", type: CategoryType.FRUIT },
        { name: "تمور", type: CategoryType.DATES },
      ],
    });
  }

  const categories = await prisma.category.findMany();
  const vegCategory = categories.find((c) => c.type === CategoryType.VEGETABLE);
  const fruitCategory = categories.find((c) => c.type === CategoryType.FRUIT);
  const datesCategory = categories.find((c) => c.type === CategoryType.DATES);

  // ----- Markets (stores) -----
  if ((await prisma.market.count()) === 0) {
    await prisma.market.createMany({
      data: [
        { name: "سوق الشمال", region: "الرياض", vendorCount: 0, operatingFrom: "08:00", operatingTo: "23:00", priceRange: "متوسط" },
        { name: "سوق الجنوب", region: "الرياض", vendorCount: 0, operatingFrom: "08:00", operatingTo: "23:00", priceRange: "اقتصادي" },
        { name: "سوق الشرق", region: "الرياض", vendorCount: 0, operatingFrom: "08:00", operatingTo: "23:00", priceRange: "مرتفع" },
        { name: "سوق الغرب", region: "الرياض", vendorCount: 0, operatingFrom: "08:00", operatingTo: "23:00", priceRange: "متوسط" },
        { name: "سوق الخضار المركزي", region: "الرياض", vendorCount: 0, operatingFrom: "06:00", operatingTo: "22:00", priceRange: "اقتصادي" },
        { name: "سوق التمور", region: "الرياض", vendorCount: 0, operatingFrom: "09:00", operatingTo: "23:00", priceRange: "متوسط" },
      ],
    });
  }

  const markets = await prisma.market.findMany();
  const mainMarket = markets[0];

  // ----- Vendor profile -----
  const vendor = await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: { displayName: "خيرات الرياض", description: "خضار وفواكه طازجة يوميًا" },
    create: {
      userId: vendorUser.id,
      displayName: "خيرات الرياض",
      description: "خضار وفواكه طازجة يوميًا",
    },
  });

  // Link vendor to a couple of markets
  if ((await prisma.marketVendor.count({ where: { vendorId: vendor.id } })) === 0) {
    const mvData = markets.slice(0, 3).map((m) => ({ marketId: m.id, vendorId: vendor.id }));
    await prisma.marketVendor.createMany({ data: mvData });
    for (const m of markets.slice(0, 3)) {
      const count = await prisma.marketVendor.count({ where: { marketId: m.id } });
      await prisma.market.update({ where: { id: m.id }, data: { vendorCount: count } });
    }
  }

  // ----- Products (about 20 sample items) -----
  if ((await prisma.product.count()) < 20) {
    const sampleProducts = [
      { name: "طماطم طازجة", price: 5.5, unit: UnitType.KILO, categoryId: vegCategory?.id },
      { name: "خيار بلدي", price: 4.0, unit: UnitType.KILO, categoryId: vegCategory?.id },
      { name: "بصل أحمر", price: 3.5, unit: UnitType.KILO, categoryId: vegCategory?.id },
      { name: "بطاطس جديدة", price: 4.5, unit: UnitType.KILO, categoryId: vegCategory?.id },
      { name: "خس روماني", price: 6.0, unit: UnitType.BUNDLE, categoryId: vegCategory?.id },
      { name: "تفاح أمريكي", price: 9.0, unit: UnitType.KILO, categoryId: fruitCategory?.id },
      { name: "موز فلبيني", price: 7.0, unit: UnitType.KILO, categoryId: fruitCategory?.id },
      { name: "عنب لبناني", price: 12.0, unit: UnitType.KILO, categoryId: fruitCategory?.id },
      { name: "برتقال عصير", price: 6.5, unit: UnitType.KILO, categoryId: fruitCategory?.id },
      { name: "فراولة طازجة", price: 15.0, unit: UnitType.BOX, categoryId: fruitCategory?.id },
      { name: "تمر خلاص", price: 18.0, unit: UnitType.BOX, categoryId: datesCategory?.id },
      { name: "تمر سكري", price: 22.0, unit: UnitType.BOX, categoryId: datesCategory?.id },
      { name: "تمر عجوة", price: 30.0, unit: UnitType.BOX, categoryId: datesCategory?.id },
      { name: "خضار مشكلة للطبخ", price: 20.0, unit: UnitType.BOX, categoryId: vegCategory?.id },
      { name: "سلطة فواكه مشكلة", price: 14.0, unit: UnitType.BOX, categoryId: fruitCategory?.id },
      { name: "خضار للشوي", price: 18.0, unit: UnitType.BOX, categoryId: vegCategory?.id },
      { name: "فاكهة استوائية مشكلة", price: 28.0, unit: UnitType.BOX, categoryId: fruitCategory?.id },
      { name: "تمر مشكل فاخر", price: 35.0, unit: UnitType.BOX, categoryId: datesCategory?.id },
      { name: "خضار أورجانيك", price: 25.0, unit: UnitType.BOX, categoryId: vegCategory?.id },
      { name: "فاكهة أورجانيك", price: 29.0, unit: UnitType.BOX, categoryId: fruitCategory?.id },
    ];

    for (const p of sampleProducts) {
      await prisma.product.create({
        data: {
          name: p.name,
          description: `${p.name} من أفضل المزارع المحلية.`,
          price: p.price,
          unit: p.unit,
          available: true,
          marketId: mainMarket.id,
          vendorId: vendor.id,
          categoryId: p.categoryId ?? null,
        },
      });
    }
  }

  // ----- App settings -----
  await prisma.appSettings.upsert({
    where: { id: "app_settings_singleton" },
    update: {},
    create: {
      id: "app_settings_singleton",
      appName: "Saudi Mercado – سعودي ميركادو",
      primaryColor: "#16a34a",
      secondaryColor: "#22c55e",
      logoUrl: null,
      deliveryFee: 10,
      taxRate: 15,
      stcPayConfig: {},
      madaConfig: {},
      applePayConfig: {},
      notificationConfig: {},
    },
  });

  // ----- Banners -----
  if ((await prisma.banner.count()) === 0) {
    await prisma.banner.createMany({
      data: [
        {
          title: "عروض نهاية الأسبوع",
          description: "خصومات على الخضار والفواكه المختارة.",
          imageUrl: "/uploads/sample-banner-1.png",
          ctaText: "تسوق الآن",
          placement: BannerPlacement.HOME_HERO,
          actionType: BannerClickActionType.PRODUCT,
          actionTargetId: null,
          externalUrl: null,
          enabled: true,
        },
        {
          title: "عرض التمور",
          description: "أفضل أنواع التمور بسعر مميز.",
          imageUrl: "/uploads/sample-banner-2.png",
          ctaText: "شاهد العروض",
          placement: BannerPlacement.HOME_MID,
          actionType: BannerClickActionType.CATEGORY,
          actionTargetId: datesCategory?.id ?? null,
          externalUrl: null,
          enabled: true,
        },
      ],
    });
  }

  // ----- Popups -----
  if ((await prisma.popup.count()) === 0) {
    await prisma.popup.create({
      data: {
        title: "مرحبًا بك في سعودي ميركادو",
        message: "سجّل الآن لتحصل على توصيل مجاني لأول طلب.",
        imageUrl: null,
        primaryCtaText: "سجّل الآن",
        secondaryCtaText: "لاحقًا",
        targetType: PopupTargetType.NEW_USERS,
        marketIds: [],
        categoryIds: [],
        enabled: true,
      },
    });
  }

  // ----- Sample order & analytics -----
  if ((await prisma.order.count()) === 0) {
    const anyProduct = await prisma.product.findFirst();
    if (anyProduct) {
      const subtotal = anyProduct.price;
      const deliveryFee = 10;
      const taxAmount = 1.5;

      const order = await prisma.order.create({
        data: {
          userId: customer.id,
          status: OrderStatus.DELIVERED,
          deliveryFee,
          subtotal,
          taxAmount,
          total: subtotal.plus(deliveryFee).plus(taxAmount),
        },
      });

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: anyProduct.id,
          vendorId: vendor.id,
          quantity: 2,
          unitPrice: anyProduct.price,
          lineTotal: anyProduct.price.mul(2),
        },
      });

      await prisma.payment.create({
        data: {
          orderId: order.id,
          method: PaymentMethod.CASH_ON_DELIVERY,
          status: PaymentStatus.PAID,
        },
      });
    }
  }

  if ((await prisma.analyticsEvent.count()) === 0) {
    await prisma.analyticsEvent.create({
      data: {
        type: "PRODUCT_VIEW",
        userId: customer.id,
        metadata: { source: "seed" },
      },
    });
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

