import React, { useContext } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ModalContext } from '../../components/context/ModalContext';

const Home = ({ navigation }) => {
  const width = Dimensions.get('window').width;
  const { openLogin } = useContext(ModalContext);

  const testimonials = [
    { name: 'Muthu Raja', role: 'Engineering Student', quote: 'DIGIAIQUEST made my exam prep super easy! The AI-generated quizzes saved me hours of study time.' },
    { name: 'Senthil', role: 'NEET Aspirant', quote: 'The platform is clean, fast, and incredibly smart. I love how it understands my subject needs perfectly.' },
    { name: 'Arun', role: 'CBSE Physics Teacher', quote: 'I use DIGIAIQUEST to create practice tests — it\'s accurate and aligned to the syllabus.' },
    { name: 'Arun Kumar T.', role: 'Class 10 Student', quote: 'The "AI Quiz" feature is a game changer. No more wasting time on Google!' },
    { name: 'Vijay', role: 'Senior Tester', quote: 'I use DIGIAIQUEST to test my knowledge and improve my skills.' },
    { name: 'Vishalini', role: 'Academic Coordinator', quote: 'Helped our institution reduce content creation time by over 70%.' },
  ];

  const features = [
    { title: 'Anytime, Anywhere Access', desc: 'Works across devices and browsers for easy access.', image: require('../../assets/1.jpeg') },
    { title: 'AI Mentor Assistance', desc: '24/7 topic explanations from subject-specific AI mentors.', image: require('../../assets/2.jpeg') },
    { title: 'Streamlined Content Evaluation', desc: 'Export and reuse assessments as learning assets.', image: require('../../assets/3.jpeg') },
    { title: 'Quick Revision with Flashcards', desc: 'Auto-generated flashcards for rapid recall.', image: require('../../assets/4.jpeg') },
    { title: 'Supports Self-Assessment', desc: 'Instant progress tracking with AI-generated quizzes.', image: require('../../assets/5.jpeg') },
    { title: 'Reduces Manual Workload', desc: 'Automated question generation for teachers.', image: require('../../assets/6.jpeg') },
  ];

  const icons = {
    Expertise: 'school-outline',
    Affordability: 'currency-inr',
    Innovation: 'lightbulb-on-outline',
    Reliability: 'shield-check-outline',
    'User-Centric': 'account-circle-outline',
    Support: 'headset',
  };

  // ✅ Only triggered when user taps "Try Now"
  const handleTryNow = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        navigation.navigate('Features');
      } else {
        openLogin(); // open login modal only if not logged in
      }
    } catch (error) {
 
    }
  };

  return (
    <ScrollView className="bg-white">
      {/* Hero Section */}
      <View className="items-center px-6 py-12 bg-blue-900 rounded-b-3xl overflow-hidden">
        <View className="absolute inset-0 opacity-20 bg-black">
          <Image source={require('../../assets/pricing.jpg')} className="w-full h-full" resizeMode="cover" />
        </View>
        <View className="z-10 items-center">
          <Image source={require('../../assets/herologo.png')} className="w-52 h-32" resizeMode="cover" />

          <Text className="text-blue-200 text-xl mb-4">AI-Powered Question Generator</Text>
          <Text className="text-blue-100 text-center text-lg mb-6 px-4">
            Transform your learning experience with our revolutionary AI-powered examination platform.
          </Text>

          {/* ✅ Try Now button triggers login only if needed */}
          <TouchableOpacity
            onPress={handleTryNow}
            className="mt-2 bg-white px-6 py-3 rounded-full shadow-lg"
            style={{ minWidth: 140, alignItems: 'center' }} // add minWidth
          >
            <Text className="text-blue-900 font-bold text-lg text-center">Try Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Features */}
      <View className="px-4 py-12 bg-white">
        <Text className="text-3xl font-bold text-center text-blue-900 mb-4">What Makes DigiAiQuest Different</Text>
        <Text className="text-center text-gray-600 text-lg mb-10">Crafted to revolutionize how you learn and teach.</Text>

        <View className="space-y-12">
          {features.map((item, index) => (
            <View
              key={index}
              className={`flex ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} items-center gap-6 bg-blue-50 p-9 rounded-2xl shadow-md`}
            >
              <Image
                source={item.image}
                className="w-[48%] h-40 rounded-xl"
                resizeMode="cover"
              />
              <View className="w-[52%]">
                <Text className="text-2xl font-bold text-blue-800 mb-2">{item.title}</Text>
                <Text className="text-gray-700 text-base leading-relaxed">{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Testimonials */}
      <View className="px-6 py-16 bg-blue-50">
        <Text className="text-3xl font-bold text-center text-blue-900 mb-3">
          What Users Say
        </Text>
        <Text className="text-center text-gray-600 text-lg mb-10">
          Hear from our satisfied community
        </Text>

        <View style={{ height: 250 }}>
          <Carousel
            loop
            width={width - 48}
            height={250}
            autoPlay
            scrollAnimationDuration={1200}
            data={testimonials}
            renderItem={({ item }) => (
              <View className="bg-white px-6 py-6 rounded-2xl shadow-lg mx-2 h-full justify-between border border-blue-100">
                <Text className="text-4xl text-blue-300 leading-none mb-2">“</Text>
                <Text className="italic font-bold text-gray-700 text-[16px] mb-4 leading-relaxed">
                  {item.quote}
                </Text>
                <View className="mt-2">
                  <Text className="text-blue-800 font-bold text-lg">{item.name}</Text>
                  <Text className="text-gray-500">{item.role}</Text>
                </View>
              </View>
            )}
          />
        </View>
      </View>

      {/* Why Choose Us */}
      <View className="px-6 py-12 bg-white">
        <Text className="text-3xl font-bold text-center text-blue-900 mb-2">Why Choose DigiAiQuest?</Text>
        <Text className="text-center text-gray-600 text-lg mb-8">Our commitment to excellence</Text>
        <View className="flex-row flex-wrap justify-between gap-4">
          {Object.entries(icons).map(([label, icon], index) => {
            const descriptions = {
              Expertise: 'Years of experience in education technology.',
              Affordability: 'Flexible pricing plans for all learners.',
              Innovation: 'Smart, evolving AI-driven solutions.',
              Reliability: 'Secure and dependable platform performance.',
              'User-Centric': 'Built around your learning journey.',
              Support: '24/7 guidance to ensure smooth experience.',
            };

            return (
              <View key={index} className="w-[48%] p-4 bg-blue-50 rounded-lg border border-blue-100 mb-3">
                <View className="flex-row items-center mb-2">
                  <Icon name={icon} size={24} color="#1e3a8a" />
                  <Text className="ml-2 text-lg font-semibold text-blue-900">{label}</Text>
                </View>
                <Text className="text-gray-700 text-sm">
                  {descriptions[label]}
                </Text>
              </View>
            );
          })}

        </View>
      </View>
    </ScrollView>
  );
};

export default Home;
