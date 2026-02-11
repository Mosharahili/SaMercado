import { Banner, Category, Market, Product } from '@app-types/models';

export const mockMarkets: Market[] = [
  {
    id: 'm1',
    name: 'سوق الخضار المركزي - الرياض',
    region: 'الرياض',
    description: 'تشكيلة يومية من الخضار والفواكه الطازجة',
    operatingHours: '04:00 ص - 12:00 م',
    priceRange: 'منخفض - متوسط',
    _count: { vendorLinks: 24, products: 320 },
  },
  {
    id: 'm2',
    name: 'سوق الشمال المركزي',
    region: 'الرياض',
    description: 'منتجات ممتازة من مزارع محلية مختارة',
    operatingHours: '05:00 ص - 11:00 م',
    priceRange: 'متوسط',
    _count: { vendorLinks: 14, products: 210 },
  },
];

export const mockCategories: Category[] = [
  { id: 'c1', nameAr: 'خضار', slug: 'vegetables' },
  { id: 'c2', nameAr: 'فواكه', slug: 'fruits' },
  { id: 'c3', nameAr: 'تمور', slug: 'dates' },
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'طماطم ممتازة',
    unit: 'كيلو',
    price: 6.5,
    isAvailable: true,
    category: mockCategories[0],
    market: mockMarkets[0],
    vendor: { id: 'v1', businessName: 'مؤسسة الخير', user: { name: 'أحمد' } },
    images: [{ id: 'img1', imageUrl: 'https://images.unsplash.com/photo-1546470427-e17ae5a2f6ff?auto=format&fit=crop&w=600&q=80' }],
  },
  {
    id: 'p2',
    name: 'تفاح أحمر فاخر',
    unit: 'صندوق',
    price: 28,
    isAvailable: true,
    category: mockCategories[1],
    market: mockMarkets[1],
    vendor: { id: 'v2', businessName: 'شركة الهضاب', user: { name: 'سعيد' } },
    images: [{ id: 'img2', imageUrl: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=600&q=80' }],
  },
  {
    id: 'p3',
    name: 'تمر سكري',
    unit: 'ربطة',
    price: 18,
    isAvailable: true,
    category: mockCategories[2],
    market: mockMarkets[0],
    vendor: { id: 'v3', businessName: 'تمور المبارك', user: { name: 'ناصر' } },
    images: [{ id: 'img3', imageUrl: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=600&q=80' }],
  },
];

export const mockBanners: Banner[] = [
  {
    id: 'b1',
    title: 'عروض اليوم على الخضار',
    description: 'خصومات حصرية حتى 25%',
    imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=1080&q=80',
    placement: 'HOME_HERO',
  },
  {
    id: 'b2',
    title: 'أجود الفواكه الموسمية',
    description: 'طازج يوميًا من السوق المركزي',
    imageUrl: 'https://images.unsplash.com/photo-1574226516831-e1dff420e43e?auto=format&fit=crop&w=1080&q=80',
    placement: 'HOME_HERO',
  },
];
