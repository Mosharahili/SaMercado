import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CustomerTabParamList } from '../types';
import { HomeScreen } from '@screens/customer/HomeScreen';
import { MarketsScreen } from '@screens/customer/MarketsScreen';
import { ProductsScreen } from '@screens/customer/ProductsScreen';
import { CartScreen } from '@screens/customer/CartScreen';
import { AccountScreen } from '@screens/customer/AccountScreen';
import { theme } from '@theme/theme';

const Tab = createBottomTabNavigator<CustomerTabParamList>();

const iconMap: Record<keyof CustomerTabParamList, keyof typeof MaterialCommunityIcons.glyphMap> = {
  Home: 'home-outline',
  Markets: 'storefront-outline',
  Products: 'food-apple-outline',
  Cart: 'cart-outline',
  Account: 'account-outline',
};

const labelMap: Record<keyof CustomerTabParamList, string> = {
  Home: 'الرئيسية',
  Markets: 'الأسواق',
  Products: 'المنتجات',
  Cart: 'السلة',
  Account: 'الحساب',
};

export const CustomerTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: '#64748b',
      tabBarStyle: {
        height: 66,
        paddingBottom: 8,
        paddingTop: 8,
        backgroundColor: '#ffffff',
        direction: 'rtl',
      },
      sceneStyle: {
        direction: 'rtl',
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '700',
      },
      tabBarIcon: ({ color, size }) => (
        <MaterialCommunityIcons name={iconMap[route.name as keyof CustomerTabParamList]} color={color} size={size} />
      ),
      tabBarLabel: labelMap[route.name as keyof CustomerTabParamList],
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Markets" component={MarketsScreen} />
    <Tab.Screen name="Products" component={ProductsScreen} />
    <Tab.Screen name="Cart" component={CartScreen} />
    <Tab.Screen name="Account" component={AccountScreen} />
  </Tab.Navigator>
);
