import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppButton } from '@components/AppButton';
import { api, UploadFile } from '@api/client';
import { Category, Product } from '@app-types/models';

type VendorOption = { id: string; businessName: string; user?: { name?: string } };

const unitOptions = ['كيلو', 'ربطة', 'صندوق'];

export const OwnerProductsScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<VendorOption[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('كيلو');
  const [vendorId, setVendorId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [selectedImages, setSelectedImages] = useState<UploadFile[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [productsRes, vendorsRes, categoriesRes] = await Promise.allSettled([
      api.get<{ products: Product[] }>('/products'),
      api.get<{ vendors: VendorOption[] }>('/vendors'),
      api.get<{ categories: Category[] }>('/categories'),
    ]);

    const productsData = productsRes.status === 'fulfilled' ? productsRes.value.products || [] : [];
    const vendorsData = vendorsRes.status === 'fulfilled' ? vendorsRes.value.vendors || [] : [];
    const categoriesData = categoriesRes.status === 'fulfilled' ? categoriesRes.value.categories || [] : [];

    setProducts(productsData);
    setVendors(vendorsData);
    setCategories(categoriesData);

    if (!vendorId && vendorsData.length) setVendorId(vendorsData[0].id);
    if (!categoryId && categoriesData.length) setCategoryId(categoriesData[0].id);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPrice('');
    setUnit('كيلو');
    setSelectedImages([]);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        quality: 0.9,
        allowsMultipleSelection: true,
        selectionLimit: 8,
      });
      if (result.canceled || !result.assets?.length) return;

      const files = result.assets.map((asset, index) => {
        const rawName = asset.fileName || asset.uri.split('/').pop() || `product-${Date.now()}-${index}.jpg`;
        const safeName = rawName.replace(/\s+/g, '_');
        return {
          uri: asset.uri,
          name: safeName,
          type: asset.mimeType || 'image/jpeg',
        } as UploadFile;
      });
      setSelectedImages(files);
    } catch (error: any) {
      Alert.alert('خطأ', error?.message || 'تعذر اختيار الصورة');
    }
  };

  const save = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert('تنبيه', 'يرجى تعبئة اسم المنتج والسعر');
      return;
    }

    const priceValue = Number(price);
    if (Number.isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('تنبيه', 'يرجى إدخال سعر صحيح');
      return;
    }

    setSaving(true);
    try {
      const effectiveVendorId = vendorId || vendors[0]?.id;
      const effectiveCategoryId = categoryId || categories[0]?.id;
      let id = editingId;
      if (editingId) {
        await api.put(`/products/${editingId}`, {
          name,
          description,
          unit,
          price: priceValue,
          ...(effectiveVendorId ? { vendorId: effectiveVendorId } : {}),
          ...(effectiveCategoryId ? { categoryId: effectiveCategoryId } : {}),
        });
      } else {
        const created = await api.post<{ product: Product }>('/products', {
          name,
          description,
          unit,
          price: priceValue,
          ...(effectiveVendorId ? { vendorId: effectiveVendorId } : {}),
          ...(effectiveCategoryId ? { categoryId: effectiveCategoryId } : {}),
        });
        id = created.product.id;
      }

      if (id && selectedImages.length) {
        await Promise.all(selectedImages.map((imageFile) => api.upload(`/products/${id}/images`, imageFile)));
      }

      Alert.alert('تم', editingId ? 'تم تحديث المنتج' : 'تمت إضافة المنتج');
      resetForm();
      load();
    } catch (error: any) {
      Alert.alert('خطأ', error?.response?.data?.error || error.message || 'فشل حفظ المنتج');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name || '');
    setDescription(product.description || '');
    setPrice(String(product.price || ''));
    setUnit(product.unit || 'كيلو');
    setVendorId(product.vendorId || product.vendor?.id || '');
    setCategoryId(product.categoryId || product.category?.id || '');
    setSelectedImages([]);
  };

  const remove = async (id: string) => {
    try {
      await api.del(`/products/${id}`);
      Alert.alert('تم', 'تم حذف المنتج');
      load();
    } catch (error: any) {
      Alert.alert('خطأ', error?.response?.data?.error || error.message || 'تعذر حذف المنتج');
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={styles.title}>{editingId ? 'تعديل منتج' : 'إضافة منتج'}</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="اسم المنتج" textAlign="right" />
        <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="الوصف" textAlign="right" />
        <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="السعر" keyboardType="decimal-pad" textAlign="right" />

        <View style={styles.pickerWrap}>
          <Picker selectedValue={unit} onValueChange={setUnit}>
            {unitOptions.map((option) => (
              <Picker.Item key={option} label={option} value={option} />
            ))}
          </Picker>
        </View>

        {vendors.length > 0 ? (
          <View style={styles.pickerWrap}>
            <Picker selectedValue={vendorId || vendors[0].id} onValueChange={setVendorId}>
              {vendors.map((vendor) => (
                <Picker.Item key={vendor.id} label={vendor.businessName} value={vendor.id} />
              ))}
            </Picker>
          </View>
        ) : null}

        {categories.length > 0 ? (
          <View style={styles.pickerWrap}>
            <Picker selectedValue={categoryId || categories[0].id} onValueChange={setCategoryId}>
              {categories.map((category) => (
                <Picker.Item key={category.id} label={category.nameAr} value={category.id} />
              ))}
            </Picker>
          </View>
        ) : null}

        <AppButton
          label={selectedImages.length ? `تم اختيار ${selectedImages.length} صور` : 'اختيار صور المنتج'}
          onPress={pickImage}
          variant="ghost"
        />
        {selectedImages.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.previewList}>
            {selectedImages.map((imageFile, index) => (
              <Image key={`${imageFile.uri}-${index}`} source={{ uri: imageFile.uri }} style={styles.previewThumb} />
            ))}
          </ScrollView>
        ) : null}

        <AppButton label={editingId ? 'حفظ التعديلات' : 'إضافة المنتج'} onPress={save} loading={saving} />
        {editingId ? <AppButton label="إلغاء التعديل" onPress={resetForm} variant="ghost" /> : null}
      </View>

      {products.map((product) => (
        <View key={product.id} style={styles.item}>
          {product.images?.[0]?.imageUrl ? (
            <Image source={{ uri: api.resolveAssetUrl(product.images[0].imageUrl) }} style={styles.itemImage} />
          ) : null}
          <Text style={styles.itemTitle}>{product.name}</Text>
          <Text style={styles.itemMeta}>البائع: {product.vendor?.businessName}</Text>
          <Text style={styles.itemMeta}>السعر: {product.price} ر.س / {product.unit}</Text>

          <View style={styles.actionRow}>
            <Pressable onPress={() => startEdit(product)} style={styles.actionBtn}>
              <Text style={styles.actionText}>تعديل</Text>
            </Pressable>
            <Pressable onPress={() => remove(product.id)} style={styles.actionDanger}>
              <Text style={styles.actionDangerText}>حذف</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: 16, padding: 14, gap: 8 },
  title: { textAlign: 'right', fontWeight: '900', color: '#0f2f3d', fontSize: 18 },
  input: {
    borderWidth: 1,
    borderColor: '#99f6e4',
    borderRadius: 10,
    backgroundColor: '#f0fdfa',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#99f6e4',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f0fdfa',
  },
  previewList: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  previewThumb: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#cffafe',
  },
  item: { backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: 12, padding: 12, gap: 5 },
  itemImage: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    marginBottom: 6,
    backgroundColor: '#cffafe',
  },
  itemTitle: { textAlign: 'right', fontWeight: '800', color: '#0f2f3d' },
  itemMeta: { textAlign: 'right', color: '#4a6572' },
  actionRow: {
    marginTop: 6,
    flexDirection: 'row-reverse',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#ecfeff',
  },
  actionText: {
    color: '#0f766e',
    fontWeight: '700',
  },
  actionDanger: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#fee2e2',
  },
  actionDangerText: {
    color: '#b91c1c',
    fontWeight: '700',
  },
});
