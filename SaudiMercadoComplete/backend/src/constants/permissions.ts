export const PERMISSIONS = {
  MANAGE_BANNERS: 'manage_banners',
  MANAGE_POPUPS: 'manage_popups',
  MANAGE_MARKETS: 'manage_markets',
  MANAGE_VENDORS: 'manage_vendors',
  MANAGE_PRODUCTS: 'manage_products',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_ORDERS: 'manage_orders',
  MANAGE_USERS: 'manage_users',
  MANAGE_PAYMENTS: 'manage_payments',
  MANAGE_SETTINGS: 'manage_settings',
} as const;

export const ALL_PERMISSION_CODES = Object.values(PERMISSIONS);
