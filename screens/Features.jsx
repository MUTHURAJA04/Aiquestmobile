
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';

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

const FeatureCard = ({ item, onPress, disabled, index, className }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 150,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, index]);

  const onPressIn = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    }
  };

  const onPressOut = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
      className={`bg-white rounded-xl mb-5 border border-gray-200 shadow-md overflow-hidden ${className ?? ''}`}
    >
      <TouchableWithoutFeedback
        onPress={onPress}
        disabled={disabled}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        accessibilityRole={disabled ? undefined : "button"}
        accessibilityLabel={`${item.title} feature card ${disabled ? 'disabled' : 'clickable'}`}
      >
        <View>
          <Image
            source={item.image}
            className="w-full h-44 rounded-t-xl"
            resizeMode="cover"
            accessibilityLabel={`${item.title} feature image`}
          />
          <View className="p-5">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-blue-900 font-bold text-xl flex-shrink">
                {item.title}
              </Text>
              <View
                className={`px-3 py-1 rounded-full ${
                  item.status === 'View More' ? 'bg-green-100' : 'bg-yellow-100'
                }`}
              >
                <Text
                  className={`text-xs font-semibold ${
                    item.status === 'View More'
                      ? 'text-green-700'
                      : 'text-yellow-700'
                  }`}
                >
                  {item.status}
                </Text>
              </View>
            </View>
            <Text className="text-gray-700 text-base leading-relaxed">
              {item.description}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};

const Features = () => {
  const navigation = useNavigation();

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Animatable.View
        animation="fadeInDown"
        duration={800}
        className="items-center bg-blue-900 rounded-b-3xl overflow-hidden mb-8"
      >
        <View className="relative h-48 w-full">
          <Animatable.Image
            animation="zoomIn"
            duration={1000}
            source={require('../assets/Home.jpg')}
            className="w-full h-full"
            resizeMode="cover"
            accessibilityLabel="Features header background image"
          />
          <View className="absolute inset-0 bg-black opacity-20 rounded-b-3xl" />
        </View>

        <View className="z-10 items-center mt-5 px-4">
          <Animatable.Text
            animation="fadeIn"
            delay={500}
            className="text-white font-extrabold text-xl mb-3 text-center"
          >
            Smarter Learning with AI Begins Here
          </Animatable.Text>
          <Animatable.Text
            animation="fadeIn"
            delay={700}
            className="text-blue-100 text-center text-lg mb-6"
          >
            Transform your learning experience with our revolutionary AI-powered examination platform.
          </Animatable.Text>
        </View>
      </Animatable.View>

      {/* Title & subtitle */}
      <View className="mb-8 items-center px-2">
        <Text className="text-blue-900 font-extrabold text-3xl text-center">
          Explore Our Features
        </Text>
        <Text className="text-gray-600 mt-2 text-center text-lg max-w-[85%]">
          Designed for students, educators & institutions
        </Text>
      </View>

      {/* Feature cards */}
      {features.map((item, index) => (
        <FeatureCard
          key={index}
          item={item}
          disabled={!item.path}
          index={index}
          className="px-5 py-5"
          onPress={() => {
            if (item.path) navigation.navigate(item.path);
          }}
        />
      ))}
    </ScrollView>
  );
};

export default Features;
