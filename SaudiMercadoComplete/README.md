# سعودي ميركادو SaudiMercado (Complete Rebuild)

New full-stack project created in:
- `SaudiMercadoComplete/backend`
- `SaudiMercadoComplete/mobile`

## Features Implemented

### Backend (Express + Prisma)
- JWT auth (login/signup/logout/me)
- Roles: `CUSTOMER`, `VENDOR`, `ADMIN`, `OWNER`
- Granular permissions model and owner admin management
- Modules: markets, categories, products, cart, orders, banners, popups, vendors, analytics, settings, notifications, payments
- Image uploads (JPG, PNG, WEBP, GIF, SVG)
- Socket.IO order status updates
- Complete Prisma schema for required domain models
- Seed script with owner account, permissions, categories, default settings

### Mobile (Expo React Native)
- Arabic-first RTL UI with modern green gradient design
- Role-based routing:
  - Customer tabs: `الرئيسية`, `الأسواق`, `المنتجات`, `السلة`, `الحساب`
  - Vendor dashboard stack
  - Admin dashboard stack
  - Owner dashboard stack
- Home hero, features, banners, popup modal support
- Product filters + grid/list toggle
- Cart + checkout with payment method selection:
  - STC Pay
  - Mada
  - Apple Pay
  - الدفع عند الاستلام
- Owner managers:
  - Banner manager
  - Popup manager
  - Admin/permissions manager
  - Markets/products/orders/analytics/settings
- Vendor portal:
  - Dashboard, products, orders, analytics, support

## Run Backend

```bash
cd SaudiMercadoComplete/backend
cp .env.example .env
npm install
npx prisma generate
# set DATABASE_URL in .env first
npx prisma migrate dev
npm run seed
npm run dev
```

### Owner seed credentials
- `owner@saudimercado.sa`
- `Owner@123456`

## Run Mobile

```bash
cd SaudiMercadoComplete/mobile
cp .env.example .env
npm install
npm run start
```

Set API URL in `mobile/.env`:
- `EXPO_PUBLIC_API_BASE_URL=https://your-render-url.onrender.com/api`

## Build Checks Executed
- Backend: `npm run build`, `npm run lint`
- Mobile: `npm run typecheck`, `expo export --platform web`, `expo export --platform ios`

