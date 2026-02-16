import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export const AppHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/icon.png')}
        style={styles.logo}
        resizeMode="cover"
      />

      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 54,
    justifyContent: 'center',
  },
  logo: {
    position: 'absolute',
    end: 0, // always stick to the right
    width: 54,
    height: 54,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#bbf7d0',
  },
  textWrap: {
    minHeight: 54,
    width: '100%',
    justifyContent: 'center',
    paddingHorizontal: 66, // leave space for logo
  },
  title: {
    color: '#0f2f3d',
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: '#4a6572',
    fontSize: 13,
    marginTop: 2,
  },
});
