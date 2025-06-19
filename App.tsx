// App.js
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Layout from './components/Layout';
import './global.css';
import LayoutNavigator from './components/LayoutNavigator';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import { ModalProvider  } from './components/ModalContext';

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
