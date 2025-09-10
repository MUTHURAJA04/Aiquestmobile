// navigation/AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/Login'; // Your login screen
import LayoutNavigator from './LayoutNavigator';
import { useAuth } from './AuthContext';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />; // Add a loading component
  }

  return (
    // <Stack.Navigator screenOptions={{ headerShown: false }}>
    //   {user ? (
    //     <Stack.Screen name="Main" component={LayoutNavigator} />
    //   ) : (
    //     <Stack.Screen name="Login" component={LoginScreen} />
    //   )}
    // </Stack.Navigator>

<Stack.Navigator screenOptions={{ headerShown: false }}>
  {user ? (
    <Stack.Screen name="Main" component={LayoutNavigator} />
  ) : (
    <Stack.Screen name="Login" component={LoginScreen} />
  )}
</Stack.Navigator>


  );
};

export default AppNavigator;