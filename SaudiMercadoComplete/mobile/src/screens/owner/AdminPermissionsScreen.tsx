import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppButton } from '@components/AppButton';
import { api } from '@api/client';
import { useLanguage } from '@hooks/useLanguage';

const permissionOptions = [
  'manage_banners',
  'manage_popups',
  'manage_markets',
  'manage_vendors',
  'manage_products',
  'view_analytics',
  'manage_orders',
  'manage_users',
  'manage_payments',
  'manage_settings',
];

export const AdminPermissionsScreen = () => {
  const { isRTL, tr } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPassword, setVendorPassword] = useState('');
  const [vendorBusinessName, setVendorBusinessName] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');

  const load = async () => {
    try {
      const response = await api.get<{ users: any[] }>('/admin/users');
      setUsers(response.users || []);
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]));
  };

  const createAdmin = async () => {
    try {
      await api.post('/admin/admins', {
        name,
        email,
        password,
        permissions: selectedPermissions,
      });

      Alert.alert(tr('تم', 'Done'), tr('تم إنشاء الأدمن بنجاح', 'Admin created successfully'));
      setName('');
      setEmail('');
      setPassword('');
      setSelectedPermissions([]);
      load();
    } catch (error: any) {
      Alert.alert(tr('خطأ', 'Error'), error?.response?.data?.error || error.message || tr('Unable to create admin', 'تعذر إنشاء الأدمن'));
    }
  };

  const createVendor = async () => {
    if (!vendorName.trim() || !vendorEmail.trim() || !vendorPassword.trim() || !vendorBusinessName.trim()) {
      Alert.alert(tr('تنبيه', 'Notice'), tr('يرجى تعبئة بيانات البائع', 'Please fill in vendor details'));
      return;
    }

    try {
      await api.post('/admin/vendors', {
        name: vendorName.trim(),
        email: vendorEmail.trim(),
        password: vendorPassword,
        businessName: vendorBusinessName.trim(),
        phone: vendorPhone.trim() || undefined,
        businessPhone: vendorPhone.trim() || undefined,
        isApproved: true,
      });

      Alert.alert(tr('تم', 'Done'), tr('تم إنشاء حساب البائع بنجاح', 'Vendor account created successfully'));
      setVendorName('');
      setVendorEmail('');
      setVendorPassword('');
      setVendorBusinessName('');
      setVendorPhone('');
      load();
    } catch (error: any) {
      Alert.alert(tr('خطأ', 'Error'), error?.response?.data?.error || error.message || tr('تعذر إنشاء البائع', 'Unable to create vendor'));
    }
  };

  const permissionLabel = (permission: string) => {
    const labels: Record<string, [string, string]> = {
      manage_banners: ['إدارة البوسترات', 'Manage Banners'],
      manage_popups: ['إدارة النوافذ', 'Manage Popups'],
      manage_markets: ['إدارة الأسواق', 'Manage Markets'],
      manage_vendors: ['إدارة البائعين', 'Manage Vendors'],
      manage_products: ['إدارة المنتجات', 'Manage Products'],
      view_analytics: ['عرض التحليلات', 'View Analytics'],
      manage_orders: ['إدارة الطلبات', 'Manage Orders'],
      manage_users: ['إدارة المستخدمين', 'Manage Users'],
      manage_payments: ['إدارة المدفوعات', 'Manage Payments'],
      manage_settings: ['إدارة الإعدادات', 'Manage Settings'],
    };
    const label = labels[permission];
    if (!label) return permission;
    return tr(label[0], label[1]);
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('إضافة Admin جديد', 'Add New Admin')}</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder={tr('الاسم', 'Name')} textAlign={isRTL ? 'right' : 'left'} />
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder={tr('البريد الإلكتروني', 'Email')} textAlign={isRTL ? 'right' : 'left'} />
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder={tr('كلمة المرور', 'Password')} secureTextEntry textAlign={isRTL ? 'right' : 'left'} />

        <Text style={[styles.subTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('الصلاحيات', 'Permissions')}</Text>
        <View style={[styles.permissionsWrap, { }]}>
          {permissionOptions.map((perm) => {
            const active = selectedPermissions.includes(perm);
            return (
              <Pressable key={perm} onPress={() => togglePermission(perm)} style={[styles.permissionPill, active && styles.permissionActive]}>
                <Text style={[styles.permissionText, active && styles.permissionTextActive]}>{permissionLabel(perm)}</Text>
              </Pressable>
            );
          })}
        </View>

        <AppButton label={tr('إنشاء الأدمن', 'Create Admin')} onPress={createAdmin} />
      </View>

      <View style={styles.card}>
        <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('إضافة بائع جديد', 'Add New Vendor')}</Text>
        <TextInput style={styles.input} value={vendorName} onChangeText={setVendorName} placeholder={tr('اسم المسؤول', 'Owner name')} textAlign={isRTL ? 'right' : 'left'} />
        <TextInput style={styles.input} value={vendorBusinessName} onChangeText={setVendorBusinessName} placeholder={tr('اسم النشاط التجاري', 'Business name')} textAlign={isRTL ? 'right' : 'left'} />
        <TextInput style={styles.input} value={vendorEmail} onChangeText={setVendorEmail} placeholder={tr('البريد الإلكتروني', 'Email')} textAlign={isRTL ? 'right' : 'left'} />
        <TextInput style={styles.input} value={vendorPhone} onChangeText={setVendorPhone} placeholder={tr('رقم الجوال (اختياري)', 'Phone number (optional)')} textAlign={isRTL ? 'right' : 'left'} />
        <TextInput style={styles.input} value={vendorPassword} onChangeText={setVendorPassword} placeholder={tr('كلمة المرور', 'Password')} secureTextEntry textAlign={isRTL ? 'right' : 'left'} />
        <AppButton label={tr('إنشاء البائع', 'Create Vendor')} onPress={createVendor} />
      </View>

      {users
        .filter((u) => u.role === 'ADMIN')
        .map((user) => (
          <View key={user.id} style={styles.item}>
            <Text style={[styles.itemTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{user.name}</Text>
            <Text style={[styles.itemMeta, { textAlign: isRTL ? 'right' : 'left' }]}>{user.email}</Text>
            <Text style={[styles.itemMeta, { textAlign: isRTL ? 'right' : 'left' }]}>
              {tr('الصلاحيات', 'Permissions')}:{' '}
              {(user.permissions || [])
                .map((p: any) => permissionLabel(p.permission?.code))
                .join(', ')}
            </Text>
          </View>
        ))}

      {users
        .filter((u) => u.role === 'VENDOR')
        .map((user) => (
          <View key={user.id} style={styles.item}>
            <Text style={[styles.itemTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{user.vendorProfile?.businessName || user.name}</Text>
            <Text style={[styles.itemMeta, { textAlign: isRTL ? 'right' : 'left' }]}>{user.email}</Text>
            <Text style={[styles.itemMeta, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('الحالة', 'Status')}: {user.vendorProfile?.isApproved ? tr('معتمد', 'Approved') : tr('قيد المراجعة', 'Pending review')}</Text>
          </View>
        ))}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  title: { fontWeight: '900', color: '#14532d', fontSize: 18 },
  subTitle: { fontWeight: '700', color: '#166534' },
  input: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  permissionsWrap: {
        flexWrap: 'wrap',
    gap: 8,
  },
  permissionPill: {
    borderWidth: 1,
    borderColor: '#86efac',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  permissionActive: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  permissionText: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '700',
  },
  permissionTextActive: {
    color: 'white',
  },
  item: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 12,
    padding: 12,
  },
  itemTitle: { fontWeight: '800', color: '#14532d' },
  itemMeta: { color: '#4b5563' },
});
