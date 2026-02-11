import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppButton } from '@components/AppButton';
import { api } from '@api/client';

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
  const [users, setUsers] = useState<any[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

      Alert.alert('تم', 'تم إنشاء الأدمن بنجاح');
      setName('');
      setEmail('');
      setPassword('');
      setSelectedPermissions([]);
      load();
    } catch (error: any) {
      Alert.alert('خطأ', error?.response?.data?.error || error.message || 'تعذر إنشاء الأدمن');
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={styles.title}>إضافة Admin جديد</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="الاسم" textAlign="right" />
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="البريد الإلكتروني" textAlign="right" />
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="كلمة المرور" secureTextEntry textAlign="right" />

        <Text style={styles.subTitle}>الصلاحيات</Text>
        <View style={styles.permissionsWrap}>
          {permissionOptions.map((perm) => {
            const active = selectedPermissions.includes(perm);
            return (
              <Pressable key={perm} onPress={() => togglePermission(perm)} style={[styles.permissionPill, active && styles.permissionActive]}>
                <Text style={[styles.permissionText, active && styles.permissionTextActive]}>{perm}</Text>
              </Pressable>
            );
          })}
        </View>

        <AppButton label="إنشاء الأدمن" onPress={createAdmin} />
      </View>

      {users
        .filter((u) => u.role === 'ADMIN')
        .map((user) => (
          <View key={user.id} style={styles.item}>
            <Text style={styles.itemTitle}>{user.name}</Text>
            <Text style={styles.itemMeta}>{user.email}</Text>
            <Text style={styles.itemMeta}>الصلاحيات: {(user.permissions || []).map((p: any) => p.permission?.code).join(', ')}</Text>
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
  title: { textAlign: 'right', fontWeight: '900', color: '#14532d', fontSize: 18 },
  subTitle: { textAlign: 'right', fontWeight: '700', color: '#166534' },
  input: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  permissionsWrap: {
    flexDirection: 'row-reverse',
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
  itemTitle: { textAlign: 'right', fontWeight: '800', color: '#14532d' },
  itemMeta: { textAlign: 'right', color: '#4b5563' },
});
