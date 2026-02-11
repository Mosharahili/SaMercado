export type Role = 'CUSTOMER' | 'VENDOR' | 'ADMIN' | 'OWNER';

export type PermissionCode =
  | 'manage_banners'
  | 'manage_popups'
  | 'manage_markets'
  | 'manage_vendors'
  | 'manage_products'
  | 'view_analytics'
  | 'manage_orders'
  | 'manage_users'
  | 'manage_payments'
  | 'manage_settings';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  permissions: PermissionCode[];
}

export interface Market {
  id: string;
  name: string;
  region: string;
  location?: string;
  description?: string;
  operatingHours?: string;
  priceRange?: string;
  imageUrl?: string;
  _count?: {
    vendorLinks: number;
    products: number;
  };
}

export interface Category {
  id: string;
  nameAr: string;
  slug: string;
}

export interface ProductImage {
  id: string;
  imageUrl: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  unit: string;
  price: number;
  isAvailable: boolean;
  category: Category;
  market: Market;
  vendor: {
    id: string;
    businessName: string;
    user?: {
      name: string;
    };
  };
  images: ProductImage[];
}

export interface Banner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  placement: 'HOME_HERO' | 'HOME_MID' | 'HOME_BOTTOM' | 'PRODUCT_TOP' | 'PRODUCT_INLINE';
  ctaText?: string;
  actionType?: string;
  actionValue?: string;
}

export interface Popup {
  id: string;
  title: string;
  message?: string;
  imageUrl?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  isDismissible: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string;
}

export type PaymentMethod = 'STC_PAY' | 'MADA' | 'APPLE_PAY' | 'CASH_ON_DELIVERY';
