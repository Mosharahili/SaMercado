import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

export const RTLView = ({
  children,
  style,
  row,
  ...props
}: {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  row?: boolean;
} & React.ComponentProps<typeof View>) => {
  return (
    <View
      style={[
        {
          flexDirection: row ? 'row-reverse' : 'column', // row-reverse if horizontal
          writingDirection: 'rtl',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};
