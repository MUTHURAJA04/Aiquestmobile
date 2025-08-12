// // navigation/LayoutNavigator.js
// import React from 'react';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import HomeScreen from '../screens/Home';
// import ProfileScreen from '../screens/Profile';
// import Features from '../screens/Features';
// import Services from '../screens/Services';
// import GenerateFromImage from '../screens/GenerateFromImage';
// import GenerateFromText from '../screens/GenerateFromText';
// import GenerateFromUrl from '../screens/GenerateFromUrl';
// import GenrateFromAudio from '../screens/GenrateFromAudio';
// import GenrateFromVideo from '../screens/GenrateFromVideo';
// import SavedQuizzes from '../screens/SavedQuizzes';
// import Pricing from '../screens/Pricing';
// import QuizAnswer from '../screens/QuizAnswer';
// import GenerateFromPDF from '../screens/GenerateFromPDF';
// import GenerateFromExcel from '../screens/GenerateFromExcel';
// import GenerateFromPPT from '../screens/GenerateFromPPT';
// import GenerateFromWikipedia from '../screens/GenerateFromWikipedia';
// import GenerateFromWord from '../screens/GenerateFromWord';


// const Stack = createNativeStackNavigator();

// const LayoutNavigator = () => {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="Home" component={HomeScreen} />
//       <Stack.Screen name="Profile" component={ProfileScreen} />
//       <Stack.Screen name="Features" component={Features} />
//       <Stack.Screen name="Services" component={Services} />
//       <Stack.Screen name="GenerateFromPDF" component={GenerateFromPDF} />
//       <Stack.Screen name="GenerateFromExcel" component={GenerateFromExcel} />
//       <Stack.Screen name="GenerateFromPPT" component={GenerateFromPPT} />
//       <Stack.Screen name="GenerateFromWikipedia" component={GenerateFromWikipedia} />
//       <Stack.Screen name="GenerateFromWord" component={GenerateFromWord} />


//       <Stack.Screen name="GenerateFromImage" component={GenerateFromImage} />
//       <Stack.Screen name="GenerateFromText" component={GenerateFromText} />
//       <Stack.Screen name="GenerateFromUrl" component={GenerateFromUrl} />
//       <Stack.Screen name="GenrateFromAudio" component={GenrateFromAudio} />
//       <Stack.Screen name="GenrateFromVideo" component={GenrateFromVideo} />
//       <Stack.Screen name="SavedQuizzes" component={SavedQuizzes} />
//       <Stack.Screen name="Pricing" component={Pricing} />
//       <Stack.Screen name="QuizAnswer" component={QuizAnswer} />
//     </Stack.Navigator>
//   );
// };

// export default LayoutNavigator;




// navigation/LayoutNavigator.js
import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const Stack = createNativeStackNavigator();

const LayoutNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null); 

  useEffect(() => {
    const checkLogin = async () => {
      try {
        
        const token = await AsyncStorage.getItem('userToken');
        setIsLoggedIn(!!token);
      } catch (error) {
        console.error('Failed to fetch login state:', error);
        setIsLoggedIn(false);
      }
    };
    checkLogin();
  }, []);

  
  if (isLoggedIn === null) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
   
        <Stack.Screen name="Home" component={HomeScreen} />
      ) : (
        
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Features" component={Features} />
          <Stack.Screen name="Services" component={Services} />
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
        </>
      )}
    </Stack.Navigator>
  );
};

export default LayoutNavigator;
