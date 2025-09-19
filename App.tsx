// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Layout from './components/Layout';
import './global.css';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ModalProvider } from './components/ModalContext';
import LayoutNavigator from './components/LayoutNavigator';
import { AuthProvider } from './components/AuthContext';
import { AppProvider } from './components/AppContext';
import { GoogleSignin } from '@react-native-google-signin/google-signin';


GoogleSignin.configure({
  webClientId: '166620426117-fao3oh656sbjp40qf79gfk7r0nbtps2b.apps.googleusercontent.com', 
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

const App = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AuthProvider>
        <AppProvider> {/* Add AppProvider here */}
          <ModalProvider>
            <NavigationContainer>
              <Layout>
                <LayoutNavigator />
              </Layout>
            </NavigationContainer>
          </ModalProvider>
        </AppProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
};

export default App;