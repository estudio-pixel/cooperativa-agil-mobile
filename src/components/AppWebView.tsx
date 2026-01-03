import React from 'react';
import { Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { CONFIG } from '../config/appConfig';

const ALLOWED_HOSTS = ['cooperativaagil.com.br'];

const shouldStayInApp = (url: string): boolean => {
  return ALLOWED_HOSTS.some(host => url.includes(host));
};

export const AppWebView: React.FC = () => {
  return (
    <WebView
      source={{ uri: CONFIG.sourceUri }}
      onShouldStartLoadWithRequest={request => {
        if (!shouldStayInApp(request.url)) {
          Linking.openURL(request.url);
          return false;
        }
        return true;
      }}
      setSupportMultipleWindows={false}
    />
  );
};
