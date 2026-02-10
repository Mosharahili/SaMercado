import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@theme/theme';

interface Popup {
  id: string;
  title: string;
  message?: string;
  imageUrl?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
}

interface PopupModalProps {
  popup: Popup | null;
  visible: boolean;
  onClose: () => void;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
}

export const PopupModal: React.FC<PopupModalProps> = ({
  popup,
  visible,
  onClose,
  onPrimaryAction,
  onSecondaryAction,
}) => {
  if (!popup) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>

          {popup.imageUrl && (
            <Image source={{ uri: popup.imageUrl }} style={styles.image} />
          )}

          <Text style={styles.title}>{popup.title}</Text>

          {popup.message && (
            <Text style={styles.message}>{popup.message}</Text>
          )}

          <View style={styles.actions}>
            {popup.secondaryCtaText && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={onSecondaryAction || onClose}
              >
                <Text style={styles.secondaryButtonText}>
                  {popup.secondaryCtaText}
                </Text>
              </TouchableOpacity>
            )}

            {popup.primaryCtaText && (
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={onPrimaryAction}
              >
                <Text style={styles.primaryButtonText}>
                  {popup.primaryCtaText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: width * 0.9,
    maxWidth: 400,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: theme.colors.text,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    minWidth: 100,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: theme.typography.fontWeight.semibold,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});