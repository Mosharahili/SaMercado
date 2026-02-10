import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@theme/theme';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  imageUrl: string;
  unit: string;
  price: number;
  quantity: number;
}

export const CartScreen = () => {
  // Mock data
  const cartItems: CartItem[] = [
    {
      id: '1',
      productId: '1',
      name: 'طماطم حمراء',
      imageUrl: 'https://via.placeholder.com/100x100',
      unit: 'كيلو',
      price: 5.50,
      quantity: 2,
    },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = 5.00;
  const tax = subtotal * 0.05;
  const total = subtotal + delivery + tax;

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemUnit}>{item.unit}</Text>
        <Text style={styles.itemPrice}>ر.س {item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.quantityControl}>
        <TouchableOpacity style={styles.quantityButton}>
          <Ionicons name="remove" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity style={styles.quantityButton}>
          <Ionicons name="add" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.removeButton}>
        <Ionicons name="trash" size={20} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  );

  const renderPriceBreakdown = () => (
    <View style={styles.priceBreakdown}>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>المجموع الفرعي</Text>
        <Text style={styles.priceValue}>ر.س {subtotal.toFixed(2)}</Text>
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>التوصيل</Text>
        <Text style={styles.priceValue}>ر.س {delivery.toFixed(2)}</Text>
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>الضرائب</Text>
        <Text style={styles.priceValue}>ر.س {tax.toFixed(2)}</Text>
      </View>
      <View style={[styles.priceRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>الإجمالي</Text>
        <Text style={styles.totalValue}>ر.س {total.toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>السلة</Text>

      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cartList}
      />

      {renderPriceBreakdown()}

      <View style={styles.checkoutSection}>
        <Text style={styles.checkoutTitle}>طريقة الدفع</Text>
        <View style={styles.paymentOptions}>
          <TouchableOpacity style={styles.paymentButton}>
            <Text style={styles.paymentButtonText}>STC Pay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.paymentButton}>
            <Text style={styles.paymentButtonText}>Mada</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.paymentButton}>
            <Text style={styles.paymentButtonText}>Apple Pay</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.paymentButton}>
            <Text style={styles.paymentButtonText}>الدفع عند الاستلام</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.checkoutButton}>
          <Text style={styles.checkoutButtonText}>إتمام الطلب</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
  cartList: {
    padding: theme.spacing.md,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  itemUnit: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  itemPrice: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    marginHorizontal: theme.spacing.sm,
  },
  removeButton: {
    padding: theme.spacing.sm,
  },
  priceBreakdown: {
    backgroundColor: theme.colors.surface,
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  priceLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  priceValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  totalLabel: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  checkoutSection: {
    padding: theme.spacing.lg,
  },
  checkoutTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  paymentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  paymentButton: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    minWidth: '48%',
    alignItems: 'center',
  },
  paymentButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  checkoutButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});