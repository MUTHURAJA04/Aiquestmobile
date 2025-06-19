// navigation/LayoutNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Home';
import ProfileScreen from '../screens/Profile';
import Features from '../screens/Features';
import Services from '../screens/Services';
import GenerateFromDocument from '../screens/GenerateFromDocument';
import GenerateFromImage from '../screens/GenerateFromImage';
import GenerateFromText from '../screens/GenerateFromText';
import GenerateFromUrl from '../screens/GenerateFromUrl';
import GenrateFromAudio from '../screens/GenrateFromAudio';
import GenrateFromVideo from '../screens/GenrateFromVideo';
import SavedQuizzes from '../screens/SavedQuizzes';
import Pricing from '../screens/Pricing';


const Stack = createNativeStackNavigator();

const LayoutNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Features" component={Features} />
      <Stack.Screen name="Services" component={Services} />
      <Stack.Screen name="GenerateFromDocument" component={GenerateFromDocument} />
      <Stack.Screen name="GenerateFromImage" component={GenerateFromImage} />
      <Stack.Screen name="GenerateFromText" component={GenerateFromText} />
      <Stack.Screen name="GenerateFromUrl" component={GenerateFromUrl} />
      <Stack.Screen name="GenrateFromAudio" component={GenrateFromAudio} />
      <Stack.Screen name="GenrateFromVideo" component={GenrateFromVideo} />
      <Stack.Screen name="SavedQuizzes" component={SavedQuizzes} />
      <Stack.Screen name="Pricing" component={Pricing} />
    </Stack.Navigator>
  );
};

export default LayoutNavigator;
