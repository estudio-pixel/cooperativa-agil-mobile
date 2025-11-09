import React from 'react';
import { useAppInitialization } from './src/hooks/useAppInitialization';
import { AppWebView } from './src/components/AppWebView';
import { SafeContainer } from './src/components';

const App: React.FC = () => {
  useAppInitialization();

  return (
    <SafeContainer>
      <AppWebView />
    </SafeContainer>
  );
};

export default App;