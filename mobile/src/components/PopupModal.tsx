import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { theme } from "@theme/theme";

interface PopupModalProps {
  visible: boolean;
  title: string;
  message?: string;
  imageUrl?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  onClose: () => void;
}

export const PopupModal: React.FC<PopupModalProps> = ({
  visible,
  title,
  message,
  imageUrl,
  primaryCtaText,
  secondaryCtaText,
  onPrimary,
  onSecondary,
  onClose,
}) => {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
          {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} /> : null}
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actionsRow}>
            {secondaryCtaText ? (
              <TouchableOpacity style={styles.secondaryBtn} onPress={onSecondary ?? onClose}>
                <Text style={styles.secondaryText}>{secondaryCtaText}</Text>
              </TouchableOpacity>
            ) : null}
            {primaryCtaText ? (
              <TouchableOpacity style={styles.primaryBtn} onPress={onPrimary ?? onClose}>
                <Text style={styles.primaryText}>{primaryCtaText}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "85%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  closeBtn: {
    position: "absolute",
    top: 8,
    left: 8,
    padding: 4,
    zIndex: 10,
  },
  closeText: {
    fontSize: 24,
    color: theme.colors.muted,
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
    textAlign: "center",
  },
  message: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.muted,
    textAlign: "center",
  },
  actionsRow: {
    flexDirection: "row-reverse",
    marginTop: 16,
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    marginLeft: 8,
  },
  primaryText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  secondaryBtn: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  secondaryText: {
    color: theme.colors.muted,
    fontSize: 14,
  },
});

