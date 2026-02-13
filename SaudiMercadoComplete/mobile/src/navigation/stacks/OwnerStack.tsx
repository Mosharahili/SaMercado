import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useLanguage } from '@hooks/useLanguage';
import { OwnerStackParamList } from '../types';
import { OwnerDashboardScreen } from '@screens/owner/OwnerDashboardScreen';
import { BannerManagerScreen } from '@screens/owner/BannerManagerScreen';
import { PopupManagerScreen } from '@screens/owner/PopupManagerScreen';
import { AdminPermissionsScreen } from '@screens/owner/AdminPermissionsScreen';
import { OwnerMarketsScreen } from '@screens/owner/OwnerMarketsScreen';
import { OwnerProductsScreen } from '@screens/owner/OwnerProductsScreen';
import { OwnerOrdersScreen } from '@screens/owner/OwnerOrdersScreen';
import { OwnerAnalyticsScreen } from '@screens/owner/OwnerAnalyticsScreen';
import { OwnerSettingsScreen } from '@screens/owner/OwnerSettingsScreen';
import { HomeScreen } from '@screens/customer/HomeScreen';
import { MarketsScreen } from '@screens/customer/MarketsScreen';
import { ProductsScreen } from '@screens/customer/ProductsScreen';
import { CartScreen } from '@screens/customer/CartScreen';
import { AccountScreen } from '@screens/customer/AccountScreen';

const Stack = createNativeStackNavigator<OwnerStackParamList>();

export const OwnerStack = () => {
  const { isRTL, tr } = useLanguage();

  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        contentStyle: { direction: isRTL ? 'rtl' : 'ltr' },
      }}
    >
      <Stack.Screen name="OwnerDashboard" component={OwnerDashboardScreen} options={{ title: tr('لوحة المالك', 'Owner Dashboard') }} />
      <Stack.Screen name="OwnerStoreHome" component={HomeScreen} options={{ title: tr('الرئيسية', 'Home') }} />
      <Stack.Screen name="OwnerStoreMarkets" component={MarketsScreen} options={{ title: tr('الأسواق', 'Markets') }} />
      <Stack.Screen name="OwnerStoreProducts" component={ProductsScreen} options={{ title: tr('المنتجات', 'Products') }} />
      <Stack.Screen name="OwnerStoreCart" component={CartScreen} options={{ title: tr('السلة', 'Cart') }} />
      <Stack.Screen name="OwnerStoreAccount" component={AccountScreen} options={{ title: tr('الحساب', 'Account') }} />
      <Stack.Screen name="OwnerBanners" component={BannerManagerScreen} options={{ title: tr('إدارة البوسترات', 'Banner Manager') }} />
      <Stack.Screen name="OwnerPopups" component={PopupManagerScreen} options={{ title: tr('إدارة النوافذ المنبثقة', 'Popup Manager') }} />
      <Stack.Screen name="OwnerAdmins" component={AdminPermissionsScreen} options={{ title: tr('إدارة الأدمن والصلاحيات', 'Admins & Permissions') }} />
      <Stack.Screen name="OwnerMarkets" component={OwnerMarketsScreen} options={{ title: tr('إدارة الأسواق', 'Manage Markets') }} />
      <Stack.Screen name="OwnerProducts" component={OwnerProductsScreen} options={{ title: tr('إدارة المنتجات', 'Manage Products') }} />
      <Stack.Screen name="OwnerOrders" component={OwnerOrdersScreen} options={{ title: tr('إدارة الطلبات', 'Manage Orders') }} />
      <Stack.Screen name="OwnerAnalytics" component={OwnerAnalyticsScreen} options={{ title: tr('التحليلات', 'Analytics') }} />
      <Stack.Screen name="OwnerSettings" component={OwnerSettingsScreen} options={{ title: tr('الإعدادات', 'Settings') }} />
    </Stack.Navigator>
  );
};
