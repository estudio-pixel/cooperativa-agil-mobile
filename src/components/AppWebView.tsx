import React from 'react';
import { WebView } from 'react-native-webview';
import { CONFIG } from '../config/appConfig';

export const AppWebView: React.FC = () => {
  return <WebView source={{ uri: CONFIG.sourceUri }} />;
};
