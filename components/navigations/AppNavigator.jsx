
// components/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginForm from '../auth/LoginForm';
import LayoutNavigator from '../LayoutNavigator';
import { useAuth } from './AuthContext';


const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return null; // Or your custom loading component
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          gestureEnabled: false // Disable back gesture for auth flow
        }}
      >
        {isAuthenticated ? (
          // Authenticated screens - user cannot go back to login
          <Stack.Screen 
            name="MainApp" 
            component={LayoutNavigator}
            options={{ gestureEnabled: false }}
          />
        ) : (
          // Auth screens - user cannot go back to app without logging in
          <Stack.Screen 
            name="Auth" 
            component={AuthStack}
            options={{ gestureEnabled: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Separate stack for authentication screens
const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginForm} />
      {/* Add other auth screens like Register if needed */}
    </Stack.Navigator>
  );
};

export default AppNavigator;