import { View, Text, Image, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCredits } from '../../services/apiClient';


const features = [
  {
    title: 'AI Quiz Generator',
    description:
      'Create topic-based or content-driven quizzes in seconds from text, PDF, audio, images, or videos.',
    status: 'View More',
    image: require('../../assets/genrate.jpeg'),
    path: "Services",
  },
  {
    title: 'AI Mentor',
    description:
      'A subject-wise virtual tutor that explains concepts and generates custom quizzes per subject.',
    status: 'Coming Soon',
    image: require('../../assets/aimentor.jpeg'),
  },
  {
    title: 'AI Scheduler',
    description:
      'Organize your study or revision plans with AI-generated timetables based on your schedule.',
    status: 'View More',
    image: require('../../assets/shoduler.jpeg'),
     path:"Scheduler",
  },
  {
    title: 'Flashcards Generator',
    description:
      'Converts notes or textbooks into interactive flashcards using AI to identify key points.',
    status: 'View More',
    image: require('../../assets/flashcard.jpeg'),
    path: "CardInput",
  },
  {
    title: 'Summary Notes',
    description:
      'Condenses long texts from PDFs or articles into short, digestible summary notes.',
    status: 'View More',
    image: require('../../assets/summary.jpeg'),
    path: "SummaryGenerate",
  },
  {
    title: 'AI Interview Simulator',
    description:
      'Mock interviews with real-time questions, resume feedback, and HR-style simulations.',
    status: 'Coming Soon',
    image: require('../../assets/interview.jpeg'),
  },
  {
    title: 'Code Assignment',
    description:
      'Upload coding tasks and get automatic test case checking, code logic, and quality evaluation.',
    status: 'Coming Soon',
    image: require('../../assets/codeassignment.jpeg'),
  },
  {
    title: 'AI Doubt Solver',
    description:
      'Real-time question answering with step-by-step solutions across subjects.',
    status: 'Coming Soon',
    image: require('../../assets/solver.jpeg'),
  },
];

const Features = () => {
  const navigation = useNavigation();
  const [credits, setCredits] = useState(0);

  // ✅ Fetch credits from API
  const fetchCredits = async () => {
    try {
      const res = await getCredits();
      setCredits(res.remaining_credits || 0);
    } catch (err) {

      setCredits(0);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  // ✅ Handle feature click with credits check
  // const handleFeatureClick = (item) => {
  //   if (!item.path) return;

  //   if (credits > 0) {
  //     // ✅ Has credits → allow navigation
  //     navigation.navigate(item.path);
  //   } else {
  //     // 🚫 No credits → show alert
  //     Alert.alert(
  //       "No Credits Available",
  //       "You have no remaining credits. Please buy a plan to continue.",
  //       [
  //         { text: "Cancel", style: "cancel" },
  //         {
  //           text: "Go to Plans",
  //           onPress: () =>
  //             Linking.openURL("https://dev.digiaiquest.com/pricing").catch((err) => {
  //               Alert.alert("Error", "Failed to open pricing page.");
  //             }),
  //         },
  //       ]
  //     );
  //   }
  // };


  // ✅ Handle feature click with credits check
const handleFeatureClick = (item) => {
  if (!item.path) return;

  // 🔹 If user has 0 credits → full block
  if (credits <= 0) {
    Alert.alert(
      "No Credits Available",
      "You have no remaining credits. Please buy a plan to continue.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Go to Plans",
          onPress: () =>
            Linking.openURL("https://dev.digiaiquest.com/pricing").catch(() =>
              Alert.alert("Error", "Failed to open pricing page.")
            ),
        },
      ]
    );
    return;
  }

  // 🔹 If user has 1–3 credits → allow only AI Quiz Generator
  if (credits <= 3) {
    if (item.title === "AI Quiz Generator") {
      navigation.navigate(item.path);
    } else {
      Alert.alert(
        "No More Credits",
        "Your current free credits allow only the AI Quiz Generator feature. Buy a plan to unlock all features.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Go to Create Page",
            onPress: () => navigation.navigate("Services"),
          },
        ]
      );
    }
    return;
  }

  // 🔹 For users with more than 3 credits → allow everything
  navigation.navigate(item.path);
};


  return (
    <ScrollView className="flex-1 bg-white">
      {/* Hero Section */}
      <View className="items-center px-6 py-12 bg-blue-900 rounded-b-3xl overflow-hidden">
        <View className="absolute inset-0 opacity-20 bg-black">
          <Image source={require('../../assets/Home.jpg')} className="w-full h-full" resizeMode="cover" />
        </View>
        <View className="z-10 items-center">
          <Text className="text-white font-extrabold text-xl mb-4">
            Smarter Learning with AI Begins Here
          </Text>
          <Text className="text-blue-100 text-center text-lg mb-6 px-4">
            Transform your learning experience with our revolutionary AI-powered examination platform.
          </Text>
        </View>
      </View>

      {/* Feature Section */}
      <View className="px-6 py-10">
        <Text className="text-3xl font-bold text-blue-900 mb-4 text-center">
          Explore Our Features
        </Text>
        <Text className="text-gray-600 text-center mb-8 text-lg">
          Designed for students, educators & institutions
        </Text>

        {features.map((item, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={item.path ? 0.7 : 1}
            disabled={!item.path}
            onPress={() => handleFeatureClick(item)}
            className="bg-white rounded-xl p-4 mb-6 shadow shadow-gray-200 border border-gray-100"
          >
            <Image
              source={item.image}
              className="w-full h-48 rounded-lg mb-4"
              resizeMode="cover"
            />
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-xl font-semibold text-blue-900">{item.title}</Text>
              <Text
                className={`text-xs font-medium px-2 py-1 rounded ${item.status === 'View More'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
                  }`}
              >
                {item.status}
              </Text>
            </View>
            <Text className="text-gray-700">{item.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

export default Features;
