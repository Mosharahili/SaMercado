import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppButton } from '@components/AppButton';
import { api, UploadFile } from '@api/client';
import { Category, Product } from '@app-types/models';
import { useLanguage } from '@hooks/useLanguage';

const unitOptions = [
  { value: 'كيلو', ar: 'كيلو', en: 'Kg' },
  { value: 'ربطة', ar: 'ربطة', en: 'Bundle' },
  { value: 'صندوق', ar: 'صندوق', en: 'Box' },
];

export const OwnerProductsScreen = () => {
  const { isRTL, tr } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('كيلو');
  const [categoryId, setCategoryId] = useState('');
  const [selectedImages, setSelectedImages] = useState<UploadFile[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [productsRes, categoriesRes] = await Promise.allSettled([
      api.get<{ products: Product[] }>('/products?includeUnavailable=true'),
      api.get<{ categories: Category[] }>('/categories'),
    ]);

    const productsData = productsRes.status === 'fulfilled' ? productsRes.value.products || [] : [];
    const categoriesData = categoriesRes.status === 'fulfilled' ? categoriesRes.value.categories || [] : [];

    setProducts(productsData);
    setCategories(categoriesData);

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
      Alert.alert(tr('خطأ', 'Error'), error?.message || tr('تعذر اختيار الصورة', 'Unable to pick image'));
    }
  };

  const save = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert(tr('تنبيه', 'Notice'), tr('يرجى تعبئة اسم المنتج والسعر', 'Please enter product name and price'));
      return;
    }

    const priceValue = Number(price);
    if (Number.isNaN(priceValue) || priceValue <= 0) {
      Alert.alert(tr('تنبيه', 'Notice'), tr('يرجى إدخال سعر صحيح', 'Please enter a valid price'));
      return;
    }

    setSaving(true);
    try {
      const effectiveCategoryId = categoryId || categories[0]?.id;
      let id = editingId;
      if (editingId) {
        await api.put(`/products/${editingId}`, {
          name,
          description,
          unit,
          price: priceValue,
          ...(effectiveCategoryId ? { categoryId: effectiveCategoryId } : {}),
        });
      } else {
        const created = await api.post<{ product: Product }>('/products', {
          name,
          description,
          unit,
          price: priceValue,
          ...(effectiveCategoryId ? { categoryId: effectiveCategoryId } : {}),
        });
        id = created.product.id;
      }

      if (id && selectedImages.length) {
        await Promise.all(selectedImages.map((imageFile) => api.upload(`/products/${id}/images`, imageFile)));
      }

      Alert.alert(tr('تم', 'Done'), editingId ? tr('تم تحديث المنتج', 'Product updated') : tr('تمت إضافة المنتج', 'Product added'));
      resetForm();
      load();
    } catch (error: any) {
      Alert.alert(tr('خطأ', 'Error'), error?.response?.data?.error || error.message || tr('فشل حفظ المنتج', 'Failed to save product'));
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
    setCategoryId(product.categoryId || product.category?.id || '');
    setSelectedImages([]);
  };

  const remove = async (id: string) => {
    try {
      const response = await api.del<{ message?: string }>(`/products/${id}`);
      Alert.alert('تم', response.message || 'تم حذف المنتج');
      load();
    } catch (error: any) {
      Alert.alert(tr('خطأ', 'Error'), error?.response?.data?.error || error.message || tr('تعذر حذف المنتج', 'Unable to delete product'));
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.card}>
        <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>{editingId ? tr('تعديل منتج', 'Edit Product') : tr('إضافة منتج', 'Add Product')}</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder={tr('اسم المنتج', 'Product name')} textAlign={isRTL ? 'right' : 'left'} />
        <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder={tr('الوصف', 'Description')} textAlign={isRTL ? 'right' : 'left'} />
        <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder={tr('السعر', 'Price')} keyboardType="decimal-pad" textAlign={isRTL ? 'right' : 'left'} />

        <View style={styles.pickerWrap}>
          <Picker selectedValue={unit} onValueChange={setUnit}>
            {unitOptions.map((option) => (
              <Picker.Item key={option.value} label={isRTL ? option.ar : option.en} value={option.value} />
            ))}
          </Picker>
        </View>

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
          label={selectedImages.length ? tr(`تم اختيار ${selectedImages.length} صور`, `${selectedImages.length} images selected`) : tr('اختيار صور المنتج', 'Choose product images')}
          onPress={pickImage}
          variant="ghost"
        />
        {selectedImages.length ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.previewList, { }]}
          >
            {selectedImages.map((imageFile, index) => (
              <Image key={`${imageFile.uri}-${index}`} source={{ uri: imageFile.uri }} style={styles.previewThumb} resizeMode="cover" />
            ))}
          </ScrollView>
        ) : null}

        <AppButton label={editingId ? tr('حفظ التعديلات', 'Save Changes') : tr('إضافة المنتج', 'Add Product')} onPress={save} loading={saving} />
        {editingId ? <AppButton label={tr('إلغاء التعديل', 'Cancel Editing')} onPress={resetForm} variant="ghost" /> : null}
      </View>

      {products.map((product) => (
        <View key={product.id} style={styles.item}>
          {product.images?.[0]?.imageUrl ? (
            <Image source={{ uri: api.resolveAssetUrl(product.images[0].imageUrl) }} style={styles.itemImage} resizeMode="cover" />
          ) : null}
          <Text style={[styles.itemTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{product.name}</Text>
          <Text style={[styles.itemMeta, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('السعر', 'Price')}: {product.price} ر.س / {product.unit}</Text>

          <View style={[styles.actionRow, { }]}>
            <Pressable onPress={() => startEdit(product)} style={styles.actionBtn}>
              <Text style={styles.actionText}>{tr('تعديل', 'Edit')}</Text>
            </Pressable>
            <Pressable onPress={() => remove(product.id)} style={styles.actionDanger}>
              <Text style={styles.actionDangerText}>{tr('حذف', 'Delete')}</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: 'rgba(255,255,255,0.97)', borderRadius: 16, padding: 14, gap: 8 },
  title: { fontWeight: '900', color: '#0f2f3d', fontSize: 18 },
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
  itemTitle: { fontWeight: '800', color: '#0f2f3d' },
  itemMeta: { color: '#4a6572' },
  actionRow: {
    marginTop: 6,
        gap: 8,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
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
    backgroundColor: '#fee2e2',
  },
  actionDangerText: {
    color: '#b91c1c',
    fontWeight: '700',
  },
});
