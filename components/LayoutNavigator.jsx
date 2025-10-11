// components/LayoutNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import all your screens
import HomeScreen from '../screens/Home';
import ProfileScreen from '../screens/Profile';
import Features from '../screens/Features';
import Services from '../screens/Services';
import GenerateFromImage from '../screens/GenerateFromImage';
import GenerateFromText from '../screens/GenerateFromText';
import GenerateFromUrl from '../screens/GenerateFromUrl';
import GenrateFromAudio from '../screens/GenrateFromAudio';
import GenrateFromVideo from '../screens/GenrateFromVideo';
import SavedQuizzes from '../screens/SavedQuizzes';
import Pricing from '../screens/Pricing';
import QuizAnswer from '../screens/QuizAnswer';
import GenerateFromPDF from '../screens/GenerateFromPDF';
import GenerateFromExcel from '../screens/GenerateFromExcel';
import GenerateFromPPT from '../screens/GenerateFromPPT';
import GenerateFromWikipedia from '../screens/GenerateFromWikipedia';
import GenerateFromWord from '../screens/GenerateFromWord';
import CreditsRibbon from '../screens/CreditsRibbon';
import CardInput from '../screens/FlashCard/CardInput';
import FlashcardList from '../screens/FlashCard/FlashcardList';

import { useNavigation } from '@react-navigation/native';
import { useAuth } from './AuthContext';
import SummaryGenerate from '../screens/SummaryNotes/SummaryGenerate';
import SummaryNoteView from '../screens/SummaryNotes/SummaryNoteView';




const Stack = createNativeStackNavigator();

const LayoutNavigator = () => {
  const { logout } = useAuth();
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await logout();
      // Navigate to login screen - adjust based on your app structure
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }], // This will vary based on your navigation structure
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const checkAuth = async () => {
        try {
          const token = await AsyncStorage.getItem('userToken');
          if (!token) {
            handleLogout();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      };

      checkAuth();
    }, [logout, navigation])
  );

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Features" component={Features} />
      <Stack.Screen name="Services" component={Services} />
      <Stack.Screen name="CreditsRibbon" component={CreditsRibbon} />
      <Stack.Screen name="GenerateFromPDF" component={GenerateFromPDF} />
      <Stack.Screen name="GenerateFromExcel" component={GenerateFromExcel} />
      <Stack.Screen name="GenerateFromPPT" component={GenerateFromPPT} />
      <Stack.Screen name="GenerateFromWikipedia" component={GenerateFromWikipedia} />
      <Stack.Screen name="GenerateFromWord" component={GenerateFromWord} />
      <Stack.Screen name="GenerateFromImage" component={GenerateFromImage} />
      <Stack.Screen name="GenerateFromText" component={GenerateFromText} />
      <Stack.Screen name="GenerateFromUrl" component={GenerateFromUrl} />
      <Stack.Screen name="GenrateFromAudio" component={GenrateFromAudio} />
      <Stack.Screen name="GenrateFromVideo" component={GenrateFromVideo} />
      <Stack.Screen name="SavedQuizzes" component={SavedQuizzes} />
      <Stack.Screen name="Pricing" component={Pricing} />
      <Stack.Screen name="QuizAnswer" component={QuizAnswer} />
      <Stack.Screen name="CardInput" component={CardInput} />
      <Stack.Screen name="Flashcard" component={FlashcardList} />
      <Stack.Screen name="SummaryGenerate" component={SummaryGenerate} />
      <Stack.Screen name="SummaryNoteView" component={SummaryNoteView} />
    </Stack.Navigator>
  );
};

export default LayoutNavigator;


