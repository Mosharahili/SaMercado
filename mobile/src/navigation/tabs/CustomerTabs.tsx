import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { HomeScreen } from "@screens/HomeScreen";
import { MarketsScreen } from "@screens/MarketsScreen";
import { ProductsScreen } from "@screens/ProductsScreen";
import { CartScreen } from "@screens/CartScreen";
import { AccountScreen } from "@screens/AccountScreen";
import { theme } from "@theme/theme";

export type CustomerTabParamList = {
  Home: undefined;
  Markets: undefined;
  Products: undefined;
  Cart: undefined;
  Account: undefined;
};

const Tab = createBottomTabNavigator<CustomerTabParamList>();

export const CustomerTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.muted,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          direction: "rtl",
        },
        sceneStyle: {
          direction: "rtl",
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";
          if (route.name === "Home") iconName = "home";
          if (route.name === "Markets") iconName = "storefront";
          if (route.name === "Products") iconName = "pricetags";
          if (route.name === "Cart") iconName = "cart";
          if (route.name === "Account") iconName = "person";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: {
          fontSize: 12,
          writingDirection: "rtl",
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "الرئيسية" }} />
      <Tab.Screen name="Markets" component={MarketsScreen} options={{ title: "الأسواق" }} />
      <Tab.Screen name="Products" component={ProductsScreen} options={{ title: "المنتجات" }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ title: "السلة" }} />
      <Tab.Screen name="Account" component={AccountScreen} options={{ title: "الحساب" }} />
    </Tab.Navigator>
  );
};
