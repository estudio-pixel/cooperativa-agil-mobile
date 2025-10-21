import React from 'react';
import { useAppInitialization } from './src/hooks/useAppInitialization';
import { AppWebView } from './src/components/AppWebView';

const App: React.FC = () => {
  useAppInitialization();

  return <AppWebView />;
};

export default App;