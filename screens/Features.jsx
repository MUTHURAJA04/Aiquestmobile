import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

const features = [
  {
    title: 'AI Quiz Generator',
    description:
      'Create topic-based or content-driven quizzes in seconds from text, PDF, audio, images, or videos.',
    status: 'View More',
    image: require('../assets/genrate.jpeg'),
    path: "Services",
  },
  {
    title: 'AI Mentor',
    description:
      'A subject-wise virtual tutor that explains concepts and generates custom quizzes per subject.',
    status: 'Coming Soon',
    image: require('../assets/aimentor.jpeg'),
  },
  {
    title: 'AI Scheduler',
    description:
      'Organize your study or revision plans with AI-generated timetables based on your schedule.',
    status: 'Coming Soon',
    image: require('../assets/shoduler.jpeg'),
  },
  {
    title: 'Flashcards Generator',
    description:
      'Converts notes or textbooks into interactive flashcards using AI to identify key points.',
    status: 'Coming Soon',
    image: require('../assets/flashcard.jpeg'),
  },
  {
    title: 'Summary Notes',
    description:
      'Condenses long texts from PDFs or articles into short, digestible summary notes.',
    status: 'Coming Soon',
    image: require('../assets/summary.jpeg'),
  },
  {
    title: 'AI Interview Simulator',
    description:
      'Mock interviews with real-time questions, resume feedback, and HR-style simulations.',
    status: 'Coming Soon',
    image: require('../assets/interview.jpeg'),
  },
  {
    title: 'Code Assignment',
    description:
      'Upload coding tasks and get automatic test case checking, code logic, and quality evaluation.',
    status: 'Coming Soon',
    image: require('../assets/codeassignment.jpeg'),
  },
  {
    title: 'AI Doubt Solver',
    description:
      'Real-time question answering with step-by-step solutions across subjects.',
    status: 'Coming Soon',
    image: require('../assets/solver.jpeg'),
  },
];

const Features = () => {
  const navigation = useNavigation();
  return (
    <ScrollView className="flex-1 bg-white">
          {/* Hero Section */}
          <View className="items-center px-6 py-12 bg-blue-900 rounded-b-3xl overflow-hidden">
        <View className="absolute inset-0 opacity-20 bg-black">
          <Image source={require('../assets/Home.jpg')} className="w-full h-full" resizeMode="cover" />
        </View>
        <View className="z-10 items-center">
           <Text className="text-white font-extrabold text-xl  mb-4">Smarter Learning with
          AI Begins Here</Text>
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
            onPress={() => {
              if (item.path) navigation.navigate(item.path);
            }}
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
