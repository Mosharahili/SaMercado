import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useLanguage } from '@hooks/useLanguage';

export const LanguageSwitcher = () => {
  const { t, toggleLanguage } = useLanguage();

  return (
    <Pressable style={styles.button} onPress={toggleLanguage}>
      <Text style={styles.text}>{t('language.switch')}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-end', // always right for Arabic
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#86efac',
    backgroundColor: 'rgba(255,255,255,0.85)',
    marginBottom: 12,
  },
  text: {
    color: '#166534',
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
