import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

interface NotificationPopupProps {
  remoteMessage: FirebaseMessagingTypes.RemoteMessage;
  isVisible: boolean;
  onClose: () => void;
}

export const NotificationPopup = ({ remoteMessage, isVisible, onClose }: NotificationPopupProps) => {
  const { notification, data } = remoteMessage;
  const title = notification?.title || 'Nova Notificação';
  const body = notification?.body || 'Você recebeu uma notificação';
  const url = data?.url;

  const handleOpenLink = () => {
    if (url) Linking.openURL(url);
  };

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
      <View style={styles.modalContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Ok</Text>
          </TouchableOpacity>

          {url ? (
            <TouchableOpacity style={styles.linkButton} onPress={handleOpenLink}>
              <Text style={styles.linkButtonText}>Abrir Link</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  closeButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
  },
  closeButtonText: {
    color: '#000',
    fontWeight: '600',
  },
  linkButton: {
    backgroundColor: '#1DA1F2', // Azul popular tipo Instagram/Twitter
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  linkButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
