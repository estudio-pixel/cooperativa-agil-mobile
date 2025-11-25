import React, { useState } from 'react';
import { useAppInitialization } from './src/hooks/useAppInitialization';
import { AppWebView } from './src/components/AppWebView';
import { SafeContainer } from './src/components';
import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { NotificationPopup } from './src/components/NotificationPopup';

const App: React.FC = () => {
 const [popupVisible, setPopupVisible] = useState(false);
 const [currentNotification, setCurrentNotification] = useState<FirebaseMessagingTypes.RemoteMessage | null>(null);

 const displayNotification = (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
  setCurrentNotification(remoteMessage);
  setPopupVisible(true);
 };

 useAppInitialization(displayNotification);

 return <SafeContainer>
  {
   currentNotification ? (
    <NotificationPopup
     remoteMessage={currentNotification}
     isVisible={popupVisible}
     onClose={() => setPopupVisible(false)}
    />
   ) : null
  }
  <AppWebView />;
 </SafeContainer>
};

export default App;