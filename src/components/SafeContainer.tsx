import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Platform } from 'react-native';
import { STATUS_BAR_CONFIG } from '../config/statusBarConfig';

interface SafeContainerProps {
  children: React.ReactNode;
}

export const SafeContainer: React.FC<SafeContainerProps> = ({ children }) => {
  const statusBarConfig = STATUS_BAR_CONFIG.default;
  
  return (
    <>
      <StatusBar 
        barStyle={statusBarConfig.barStyle}
        backgroundColor={statusBarConfig.backgroundColor}
        translucent={statusBarConfig.translucent}
      />
      <SafeAreaView style={styles.container}>
        {children}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    ...Platform.select({
      ios: {
        paddingTop: 0, // SafeAreaView já cuida do padding no iOS
      },
      android: {
        paddingTop: StatusBar.currentHeight || 0, // Adiciona padding no Android se necessário
      },
    }),
  },
});
