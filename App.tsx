// App.js
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Layout from './components/Layout';
import './global.css';
import LayoutNavigator from './components/LayoutNavigator';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import { ModalProvider  } from './components/ModalContext';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
webClientId: '666282751382-h6qrk8e5jrkn8v104m08t8vmc6so93n3.apps.googleusercontent.com', 
  offlineAccess: true,
});

const App = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ModalProvider >
        <NavigationContainer>
        <Layout>
          <LayoutNavigator />
        </Layout>
      </NavigationContainer>
      </ModalProvider >
    </GestureHandlerRootView>
  );
};

export default App;
