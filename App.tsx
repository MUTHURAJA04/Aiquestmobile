// App.js
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Layout from './components/Layout';
import './global.css';
import LayoutNavigator from './components/LayoutNavigator';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

const App = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <NavigationContainer>
        <Layout>
          <LayoutNavigator />
        </Layout>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;
