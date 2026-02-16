import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ar = {
  'tabs.home': 'الرئيسية',
  'tabs.markets': 'الأسواق',
  'tabs.products': 'المنتجات',
  'tabs.cart': 'السلة',
  'tabs.account': 'الحساب',
  'auth.appName': 'سعودي ميركادو',
  'auth.tagline': 'اطلب خضارك وفواكهك مباشرة من السوق',
  'auth.login': 'تسجيل الدخول',
  'auth.signup': 'إنشاء حساب جديد',
  'auth.name': 'الاسم',
  'auth.email': 'البريد الإلكتروني',
  'auth.password': 'كلمة المرور',
  'auth.noAccount': 'ليس لديك حساب؟ أنشئ حساب جديد',
  'auth.hasAccount': 'لديك حساب؟ تسجيل الدخول',
  'auth.fillLogin': 'يرجى إدخال البريد الإلكتروني وكلمة المرور',
  'auth.fillAll': 'يرجى تعبئة جميع الحقول',
  'auth.passwordMin': 'كلمة المرور يجب أن تكون 6 أحرف على الأقل',
  'auth.loginFailed': 'فشل تسجيل الدخول',
  'auth.signupFailed': 'فشل إنشاء الحساب',
  'alert.notice': 'تنبيه',
  'alert.error': 'خطأ',
  'account.title': 'الحساب',
  'account.subtitle': 'إدارة الملف الشخصي',
  'account.name': 'الاسم',
  'account.email': 'البريد الإلكتروني',
  'account.notifications': 'إشعارات الحساب',
  'account.orderUpdates': 'تحديث حالة الطلبات - مفعل',
  'account.promotions': 'العروض الترويجية - مفعل',
  'account.myOrders': 'طلباتي',
  'account.noOrders': 'لا توجد طلبات بعد',
  'account.status': 'الحالة',
  'account.total': 'الإجمالي',
  'account.refreshOrders': 'تحديث الطلبات',
  'account.logout': 'تسجيل الخروج',
  'account.language': 'اللغة',
  'common.backToDashboard': 'العودة للوحة التحكم',
} as const;

export type TranslationKey = keyof typeof ar;

type LanguageContextValue = {
  isLoading: boolean;
  tr: (arabic: string, _english: string) => string;
  locale: 'ar-SA';
  t: (key: TranslationKey) => string;
  isRTL: true;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      isLoading,
      tr: (arabic) => arabic,
      locale: 'ar-SA',
      t: (key) => ar[key],
      isRTL: true,
    }),
    [isLoading]
  );

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
    }
  }, []);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
