// components/LayoutNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import all your screens
import HomeScreen from '../screens/HomeScreen/Home';
import ProfileScreen from '../screens/HomeScreen/Profile';
import Features from '../screens/HomeScreen/Features';
import Services from '../screens/HomeScreen/Services';

import GenerateFromText from '../screens/QuizGenerate/GenerateFromText';
import GenerateFromUrl from '../screens/QuizGenerate/GenerateFromUrl';
import GenrateFromAudio from '../screens/QuizGenerate/GenrateFromAudio';
import GenrateFromVideo from '../screens/QuizGenerate/GenrateFromVideo';
import Pricing from '../screens/HomeScreen/Pricing';
import QuizAnswer from '../screens/QuizGenerate/QuizAnswer';
import GenerateFromPPT from '../screens/QuizGenerate/GenerateFromPPT';
import GenerateFromWikipedia from '../screens/QuizGenerate/GenerateFromWikipedia';
import GenerateFromWord from '../screens/QuizGenerate/GenerateFromWord';
import CreditsRibbon from '../screens/Credits/CreditsRibbon';
import CardInput from '../screens/FlashCard/CardInput';
import FlashcardList from '../screens/FlashCard/FlashcardList';

import { useNavigation } from '@react-navigation/native';
import { useAuth } from './navigations/AuthContext';
import SummaryGenerate from '../screens/SummaryNotes/SummaryGenerate';
import SummaryNoteView from '../screens/SummaryNotes/SummaryNoteView';
import PageNotFound from './common/PageNotFound';
import GenerateFromImage from '../screens/QuizGenerate/GenerateFromImage';
import SavedQuizzes from '../screens/QuizGenerate/SavedQuizzes';
import GenerateFromPDF from '../screens/QuizGenerate/GenerateFromPDF';
import GenerateFromExcel from '../screens/QuizGenerate/GenerateFromExcel';
import SchedulerList from '../screens/Scheduler/SchedulerList';
import ScheduleText from '../screens/Scheduler/ScheduleText';
import ScheduleImage from '../screens/Scheduler/ScheduleImage';
import ScheduleWord from '../screens/Scheduler/ScheduleWord';
import ScheduleAudio from '../screens/Scheduler/ScheduleAudio';
import ScheduleVideo from '../screens/Scheduler/ScheduleVideo';




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

      {/* FlashCard */}
      <Stack.Screen name="Flashcard" component={FlashcardList} />

      {/* Summarynotes */}
      <Stack.Screen name="SummaryGenerate" component={SummaryGenerate} />
      <Stack.Screen name="SummaryNoteView" component={SummaryNoteView} />


      {/* AI Scheduler */}
      <Stack.Screen name="Scheduler" component={SchedulerList} />
      <Stack.Screen name="ScheduleText" component={ScheduleText} />
      <Stack.Screen name="ScheduleImage" component={ScheduleImage} />
      <Stack.Screen name="ScheduleAudio" component={ScheduleAudio} />
      <Stack.Screen name="ScheduleVideo" component={ScheduleVideo} />
      <Stack.Screen name="ScheduleWord" component={ScheduleWord} />





      {/* ✅ 404 fallback */}
      <Stack.Screen name="PageNotFound" component={PageNotFound} />
    </Stack.Navigator>
  );
};

export default LayoutNavigator;


