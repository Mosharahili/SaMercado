import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '@screens/HomeScreen';
import { MarketsScreen } from '@screens/MarketsScreen';
import { ProductsScreen } from '@screens/ProductsScreen';
import { CartScreen } from '@screens/CartScreen';
import { AccountScreen } from '@screens/AccountScreen';
import { theme } from '@theme/theme';

export type CustomerTabParamList = {
  Home: undefined;
  Markets: undefined;
  Products: undefined;
  Cart: undefined;
  Account: undefined;
};

const Tab = createBottomTabNavigator<CustomerTabParamList>();

export const CustomerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Markets') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          } else if (route.name === 'Products') {
            iconName = focused ? 'basket' : 'basket-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'الرئيسية' }}
      />
      <Tab.Screen
        name="Markets"
        component={MarketsScreen}
        options={{ tabBarLabel: 'الأسواق' }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsScreen}
        options={{ tabBarLabel: 'المنتجات' }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{ tabBarLabel: 'السلة' }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{ tabBarLabel: 'الحساب' }}
      />
    </Tab.Navigator>
  );
};