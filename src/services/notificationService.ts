import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import { CONFIG } from '../config/appConfig';
import { createTopicName } from '../utils/textUtils';

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permissão de notificação concedida (Android)');
          return true;
        } else {
          console.log('Permissão de notificação negada (Android)');
          return false;
        }
      } else {
        console.log('Permissão de notificação automática (Android < 13)');
        return true;
      }
    }
    
    const currentStatus = await messaging().hasPermission();
    
    if (currentStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        currentStatus === messaging.AuthorizationStatus.PROVISIONAL) {
      await messaging().registerDeviceForRemoteMessages();
      return true;
    }
    
    const authStatus = await messaging().requestPermission({
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    });
    
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Permissão de notificação concedida (iOS):', authStatus);
      await messaging().registerDeviceForRemoteMessages();
      
      return true;
    } else {
      console.log('Permissão de notificação negada (iOS)');
      return false;
    }
  } catch (error) {
    console.error('Erro ao solicitar permissão de notificação:', error);
    return false;
  }
};

export const getFCMToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'ios') {
      const isRegistered = messaging().isDeviceRegisteredForRemoteMessages;
      
      if (!isRegistered) {
        await messaging().registerDeviceForRemoteMessages();
      }
    }
    
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log('Token FCM obtido:', fcmToken);
      return fcmToken;
    } else {
      console.log('Nenhum token FCM foi retornado');
    }
    return null;
  } catch (error) {
    console.error('Erro ao obter token FCM:', error);
    return null;
  }
};

export const subscribeToLocationTopic = async (city: string, state?: string, country?: string): Promise<void> => {
  try {
    const topicName = createTopicName(city, state, country);

    await messaging().subscribeToTopic(topicName);
    console.log(`Subscrito ao tópico: ${topicName} para localização: ${[city, state, country].filter(Boolean).join(', ')}`);
  } catch (error) {
    console.error('Erro ao subscrever ao tópico:', error);
  }
};

export const setupNotificationHandlers = (displayNotification: (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => void): void => {
  messaging().onMessage(async remoteMessage => {
    console.log('Notificação recebida em foreground:', remoteMessage);
    displayNotification(remoteMessage);
  });

  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('App aberto através de notificação:', remoteMessage);
    displayNotification(remoteMessage);
  });

  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('App inicializado através de notificação:', remoteMessage);
        setTimeout(() => {
          displayNotification(remoteMessage);
        }, CONFIG.notifications.displayDelay);
      }
    });
};
