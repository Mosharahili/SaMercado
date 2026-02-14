import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type AppLanguage = 'ar' | 'en';

const LANGUAGE_KEY = 'app_language';
const LANGUAGE_SELECTED_KEY = 'app_language_selected';

const ar = {
  'language.switch': 'English',
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

const en: Record<keyof typeof ar, string> = {
  'language.switch': 'العربية',
  'tabs.home': 'Home',
  'tabs.markets': 'Markets',
  'tabs.products': 'Products',
  'tabs.cart': 'Cart',
  'tabs.account': 'Account',
  'auth.appName': 'Saudi Mercado',
  'auth.tagline': 'Order fresh fruits and vegetables directly from the market',
  'auth.login': 'Sign In',
  'auth.signup': 'Create Account',
  'auth.name': 'Name',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.noAccount': "Don't have an account? Create one",
  'auth.hasAccount': 'Already have an account? Sign in',
  'auth.fillLogin': 'Please enter your email and password',
  'auth.fillAll': 'Please fill in all fields',
  'auth.passwordMin': 'Password must be at least 6 characters',
  'auth.loginFailed': 'Failed to sign in',
  'auth.signupFailed': 'Failed to create account',
  'alert.notice': 'Notice',
  'alert.error': 'Error',
  'account.title': 'Account',
  'account.subtitle': 'Manage your profile',
  'account.name': 'Name',
  'account.email': 'Email',
  'account.notifications': 'Account notifications',
  'account.orderUpdates': 'Order status updates - enabled',
  'account.promotions': 'Promotions - enabled',
  'account.myOrders': 'My orders',
  'account.noOrders': 'No orders yet',
  'account.status': 'Status',
  'account.total': 'Total',
  'account.refreshOrders': 'Refresh orders',
  'account.logout': 'Log out',
  'account.language': 'Language',
  'common.backToDashboard': 'Back to dashboard',
};

const translations = { ar, en } as const;

export type TranslationKey = keyof typeof ar;

type LanguageContextValue = {
  language: AppLanguage;
  isLoading: boolean;
  setLanguage: (language: AppLanguage) => Promise<void>;
  toggleLanguage: () => Promise<void>;
  tr: (arabic: string, english: string) => string;
  locale: 'ar-SA' | 'en-US';
  t: (key: TranslationKey) => string;
  isRTL: boolean;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);
const isWeb = Platform.OS === 'web';

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<AppLanguage>('ar');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        let initialLanguage: AppLanguage = 'ar';
        const [storedLanguage, languageSelected] = await Promise.all([
          AsyncStorage.getItem(LANGUAGE_KEY),
          AsyncStorage.getItem(LANGUAGE_SELECTED_KEY),
        ]);

        // Guarantee Arabic by default unless user explicitly selected another language.
        if (languageSelected === '1' && (storedLanguage === 'ar' || storedLanguage === 'en')) {
          initialLanguage = storedLanguage;
        } else {
          await AsyncStorage.multiSet([
            [LANGUAGE_KEY, 'ar'],
            [LANGUAGE_SELECTED_KEY, '0'],
          ]);
        }
        setLanguageState(initialLanguage);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  const setLanguage = async (next: AppLanguage) => {
    if (next === language) return;
    await AsyncStorage.multiSet([
      [LANGUAGE_KEY, next],
      [LANGUAGE_SELECTED_KEY, '1'],
    ]);
    setLanguageState(next);
  };

  const toggleLanguage = async () => {
    const next = language === 'ar' ? 'en' : 'ar';
    await setLanguage(next);
  };

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      isLoading,
      setLanguage,
      toggleLanguage,
      tr: (arabic, english) => (language === 'ar' ? arabic : english),
      locale: language === 'ar' ? 'ar-SA' : 'en-US',
      t: (key) => translations[language][key],
      isRTL: language === 'ar',
    }),
    [language, isLoading]
  );

  useEffect(() => {
    if (isWeb && typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
