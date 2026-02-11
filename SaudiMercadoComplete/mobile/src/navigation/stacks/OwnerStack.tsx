import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

const Stack = createNativeStackNavigator<OwnerStackParamList>();

export const OwnerStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="OwnerDashboard" component={OwnerDashboardScreen} options={{ title: 'لوحة المالك' }} />
    <Stack.Screen name="OwnerBanners" component={BannerManagerScreen} options={{ title: 'إدارة البوسترات' }} />
    <Stack.Screen name="OwnerPopups" component={PopupManagerScreen} options={{ title: 'إدارة النوافذ المنبثقة' }} />
    <Stack.Screen name="OwnerAdmins" component={AdminPermissionsScreen} options={{ title: 'إدارة الأدمن والصلاحيات' }} />
    <Stack.Screen name="OwnerMarkets" component={OwnerMarketsScreen} options={{ title: 'إدارة الأسواق' }} />
    <Stack.Screen name="OwnerProducts" component={OwnerProductsScreen} options={{ title: 'إدارة المنتجات' }} />
    <Stack.Screen name="OwnerOrders" component={OwnerOrdersScreen} options={{ title: 'إدارة الطلبات' }} />
    <Stack.Screen name="OwnerAnalytics" component={OwnerAnalyticsScreen} options={{ title: 'التحليلات' }} />
    <Stack.Screen name="OwnerSettings" component={OwnerSettingsScreen} options={{ title: 'الإعدادات' }} />
  </Stack.Navigator>
);
