// import React, { useContext } from 'react';
// import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
// import Carousel from 'react-native-reanimated-carousel';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { ModalContext } from '../components/ModalContext';

// const Home = ({ navigation }) => {
//   const width = Dimensions.get('window').width;
//   const { openLogin } = useContext(ModalContext);

//   const testimonials = [
//     { name: 'Muthu Raja', role: 'Engineering Student', quote: 'DIGIAIQUEST made my exam prep super easy! The AI-generated quizzes saved me hours of study time.' },
//     { name: 'Senthil', role: 'NEET Aspirant', quote: 'The platform is clean, fast, and incredibly smart. I love how it understands my subject needs perfectly.' },
//     { name: 'Arun', role: 'CBSE Physics Teacher', quote: 'I use DIGIAIQUEST to create practice tests — it\'s accurate and aligned to the syllabus.' },
//     { name: 'Arun Kumar T.', role: 'Class 10 Student', quote: 'The "AI Quiz" feature is a game changer. No more wasting time on Google!' },
//     { name: 'Vijay', role: 'senior Tester', quote: 'i use DIGIAIQUEST to test my knowledge and improve my skills.' },
//     { name: 'Vishalini', role: 'Academic Coordinator', quote: 'Helped our institution reduce content creation time by over 70%.' },
//   ];

//   const features = [
//     { title: 'Anytime, Anywhere Access', desc: 'Works across devices and browsers for easy access.', image: require('../assets/1.jpeg') },
//     { title: 'AI Mentor Assistance', desc: '24/7 topic explanations from subject-specific AI mentors.', image: require('../assets/2.jpeg') },
//     { title: 'Streamlined Content Evaluation', desc: 'Export and reuse assessments as learning assets.', image: require('../assets/3.jpeg') },
//     { title: 'Quick Revision with Flashcards', desc: 'Auto-generated flashcards for rapid recall.', image: require('../assets/4.jpeg') },
//     { title: 'Supports Self-Assessment', desc: 'Instant progress tracking with AI-generated quizzes.', image: require('../assets/5.jpeg') },
//     { title: 'Reduces Manual Workload', desc: 'Automated question generation for teachers.', image: require('../assets/6.jpeg') },
//   ];

//   const icons = {
//     Expertise: 'school-outline',
//     Affordability: 'currency-inr',
//     Innovation: 'lightbulb-on-outline',
//     Reliability: 'shield-check-outline',
//     'User-Centric': 'account-circle-outline',
//     Support: 'headset'
//   };


//  const handleTryNow = async () => {
//     const user = await AsyncStorage.getItem('user');
//     if (user) {
//       navigation.navigate("Features");
//     } else {
//       openLogin();
//     }
//   };


//   return (
//     <ScrollView className="bg-white">
//       {/* Hero Section */}
//       <View className="items-center px-6 py-12 bg-blue-900 rounded-b-3xl overflow-hidden">
//         <View className="absolute inset-0 opacity-20 bg-black">
//           <Image source={require('../assets/pricing.jpg')} className="w-full h-full" resizeMode="cover" />
//         </View>
//         <View className="z-10 items-center">
//         <Image source={require('../assets/herologo.png')} className="w-52 h-32 " resizeMode="cover" />

//           <Text className="text-blue-200 text-xl mb-4">AI-Powered Question Generator</Text>
//           <Text className="text-blue-100 text-center text-lg mb-6 px-4">
//             Transform your learning experience with our revolutionary AI-powered examination platform.
//           </Text>
//           <TouchableOpacity
//             className="mt-2 bg-white px-8 py-3 rounded-full shadow-lg"
//             onPress={handleTryNow}
//           >
//             <Text className="text-blue-900 font-bold text-lg">Try Now</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Features - Attractive Zig-Zag Layout */}
//       <View className="px-4 py-12 bg-white">
//         <Text className="text-3xl font-bold text-center text-blue-900 mb-4">What Makes DigiAiQuest Different</Text>
//         <Text className="text-center text-gray-600 text-lg mb-10">Crafted to revolutionize how you learn and teach.</Text>

//         <View className="space-y-12">
//           {features.map((item, index) => (
//             <View
//               key={index}
//               className={`flex ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} items-center gap-6 bg-blue-50 p-9 rounded-2xl shadow-md`}
//             >
//               <Image
//                 source={item.image}
//                 className="w-[48%] h-40 rounded-xl"
//                 resizeMode="cover"
//               />
//               <View className="w-[52%]">
//                 <Text className="text-2xl font-bold text-blue-800 mb-2">{item.title}</Text>
//                 <Text className="text-gray-700 text-base leading-relaxed">{item.desc}</Text>
//               </View>
//             </View>
//           ))}
//         </View>
//       </View>


//       {/* Testimonials */}
//       <View className="px-6 py-16 bg-blue-50">
//         <Text className="text-3xl font-bold text-center text-blue-900 mb-3">
//           What Users Say
//         </Text>
//         <Text className="text-center text-gray-600 text-lg mb-10">
//           Hear from our satisfied community
//         </Text>

//         <View style={{ height: 250 }}>
//           <Carousel
//             loop
//             width={width - 48}
//             height={250}
//             autoPlay={true}
//             scrollAnimationDuration={1200}
//             data={testimonials}
//             renderItem={({ item }) => (
//               <View className="bg-white px-6 py-6 rounded-2xl shadow-lg mx-2 h-full justify-between border border-blue-100">
//                 {/* Quote Icon */}
//                 <Text className="text-4xl text-blue-300 leading-none mb-2">“</Text>

//                 {/* Quote Text */}
//                 <Text className="italic font-bold text-gray-700 text-[16px] mb-4 leading-relaxed">
//                   {item.quote}
//                 </Text>

//                 {/* User Info */}
//                 <View className="mt-2">
//                   <Text className="text-blue-800 font-bold text-lg">{item.name}</Text>
//                   <Text className="text-gray-500">{item.role}</Text>
//                 </View>
//               </View>
//             )}
//           />
//         </View>
//       </View>



//       {/* Comparison Section */}
//       <View className="px-6 py-16 bg-gray-50">
//         <Text className="text-3xl font-bold text-center text-blue-900 mb-4">
//           DigiAiQuest vs Other AI Quiz Platforms
//         </Text>
//         <Text className="text-center text-gray-600 text-lg mb-12">
//           See how DigiAiQuest stands out in delivering educational value.
//         </Text>

//         <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//           <View className="min-w-[740px]">
//             {/* Table Header */}
//             <View className="flex-row bg-blue-100 rounded-t-2xl py-5 px-6 border border-blue-200">
//               <Text className="w-[200px] font-bold text-blue-900 text-base">Key Capability</Text>
//               <Text className="w-[180px] text-center font-bold text-blue-900 text-base">DigiAiQuest</Text>
//               <Text className="w-[180px] text-center font-bold text-blue-900 text-base">Other Platforms</Text>
//               <Text className="w-[180px] text-center font-bold text-blue-900 text-base">Other AI Quiz Platform</Text>
//             </View>

//             {/* Table Rows */}
//             {[
//               {
//                 label: 'Academic Quiz Accuracy',
//                 values: ['99.9% Precision', '72% Accuracy', '65% Accuracy'],
//               },
//               {
//                 label: 'Subject-Specific Intelligence',
//                 values: ['Advanced Understanding', 'Moderate', 'Basic'],
//               },
//               {
//                 label: 'Textbook Integration',
//                 values: ['Complete Support', 'Partial Integration', 'Limited Compatibility'],
//               },
//               {
//                 label: 'Question Type Variety',
//                 values: ['High Range', 'Medium Range', 'Low Range'],
//               },
//               {
//                 label: 'Learning Outcome Focus',
//                 values: ['Academic Success', 'General Use', 'Limited Academic Use'],
//               },
//             ].map((item, index) => (
//               <View
//                 key={index}
//                 className={`flex-row py-6 px-6 border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
//                   }`}
//               >
//                 <Text className="w-[200px] text-gray-800 font-medium text-[15px]">{item.label}</Text>
//                 <Text className="w-[180px] text-green-700 text-center font-semibold text-[15px]">{item.values[0]}</Text>
//                 <Text className="w-[180px] text-gray-700 text-center text-[15px]">{item.values[1]}</Text>
//                 <Text className="w-[180px] text-gray-700 text-center text-[15px]">{item.values[2]}</Text>
//               </View>
//             ))}

//             {/* Footer Border Radius Fix */}
//             <View className="h-2 bg-blue-100 rounded-b-2xl" />
//           </View>
//         </ScrollView>
//       </View>

//       {/* Why Choose Us */}
//       <View className="px-6 py-12 bg-white">
//         <Text className="text-3xl font-bold text-center text-blue-900 mb-2">Why Choose DigiAiQuest?</Text>
//         <Text className="text-center text-gray-600 text-lg mb-8">Our commitment to excellence</Text>
//         <View className="flex-row flex-wrap justify-between gap-4">
//           {Object.entries(icons).map(([label, icon], index) => (
//             <View key={index} className="w-[48%] p-4 bg-blue-50 rounded-lg border border-blue-100 mb-3">
//               <View className="flex-row items-center mb-2">
//                 <Icon name={icon} size={24} color="#1e3a8a" />
//                 <Text className="ml-2 text-lg font-semibold text-blue-900">{label}</Text>
//               </View>
//               <Text className="text-gray-700 text-sm">
//                 {{
//                   Expertise: 'Years of experience in education technology.',
//                   Affordability: 'Flexible pricing plans for all learners.',
//                   Innovation: 'Smart, evolving AI-driven solutions.',
//                   Reliability: 'Secure and dependable platform performance.',
//                   'User-Centric': 'Built around your learning journey.',
//                   Support: '24/7 guidance to ensure smooth experience.'
//                 }[label]}
//               </Text>
//             </View>
//           ))}
//         </View>
//       </View>
//     </ScrollView>
//   );
// };

// export default Home;







import React, { useContext, useState, useRef } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions, Animated } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ModalContext } from '../components/ModalContext';
import * as Animatable from 'react-native-animatable';

const Home = ({ navigation }) => {
  const width = Dimensions.get('window').width;
  const { openLogin } = useContext(ModalContext);

  // For button press scale animation
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const testimonials = [
    { name: 'Muthu Raja', role: 'Engineering Student', quote: 'DIGIAIQUEST made my exam prep super easy! The AI-generated quizzes saved me hours of study time.' },
    { name: 'Senthil', role: 'NEET Aspirant', quote: 'The platform is clean, fast, and incredibly smart. I love how it understands my subject needs perfectly.' },
    { name: 'Arun', role: 'CBSE Physics Teacher', quote: 'I use DIGIAIQUEST to create practice tests — it\'s accurate and aligned to the syllabus.' },
    { name: 'Arun Kumar T.', role: 'Class 10 Student', quote: 'The "AI Quiz" feature is a game changer. No more wasting time on Google!' },
    { name: 'Vijay', role: 'Senior Tester', quote: 'I use DIGIAIQUEST to test my knowledge and improve my skills.' },
    { name: 'Vishalini', role: 'Academic Coordinator', quote: 'Helped our institution reduce content creation time by over 70%.' },
  ];

  const features = [
    { title: 'Anytime, Anywhere Access', desc: 'Works across devices and browsers for easy access.', image: require('../assets/1.jpeg') },
    { title: 'AI Mentor Assistance', desc: '24/7 topic explanations from subject-specific AI mentors.', image: require('../assets/2.jpeg') },
    { title: 'Streamlined Content Evaluation', desc: 'Export and reuse assessments as learning assets.', image: require('../assets/3.jpeg') },
    { title: 'Quick Revision with Flashcards', desc: 'Auto-generated flashcards for rapid recall.', image: require('../assets/4.jpeg') },
    { title: 'Supports Self-Assessment', desc: 'Instant progress tracking with AI-generated quizzes.', image: require('../assets/5.jpeg') },
    { title: 'Reduces Manual Workload', desc: 'Automated question generation for teachers.', image: require('../assets/6.jpeg') },
  ];

  const icons = {
    Expertise: 'school-outline',
    Affordability: 'currency-inr',
    Innovation: 'lightbulb-on-outline',
    Reliability: 'shield-check-outline',
    'User-Centric': 'account-circle-outline',
    Support: 'headset'
  };

  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const handleTryNow = async () => {
    const user = await AsyncStorage.getItem('user');
    if (user) {
      navigation.navigate("Features");
    } else {
      openLogin();
    }
  };

  // Animate button press in/out
  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <ScrollView className="bg-gray-50" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Hero Section */}
      <Animatable.View animation="fadeInDown" duration={800} className="items-center px-6 py-12 bg-blue-900 rounded-b-3xl overflow-hidden">
        <View className="absolute inset-0 opacity-20 bg-black" pointerEvents="none">
          <Image
            source={require('../assets/pricing.jpg')}
            className="w-full h-full"
            resizeMode="cover"
            accessibilityLabel="Background Hero Image"
          />
        </View>
        <View className="z-10 items-center">
          <Animatable.Image
            animation="zoomIn"
            duration={1000}
            source={require('../assets/herologo.png')}
            className="w-52 h-32"
            resizeMode="cover"
            accessibilityLabel="DigiAiQuest Logo"
          />
          <Text className="text-blue-200 text-xl mb-4 font-semibold">AI-Powered Question Generator</Text>
          <Text className="text-blue-100 text-center text-lg mb-6 px-4">
            Transform your learning experience with our revolutionary AI-powered examination platform.
          </Text>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              className="mt-2 bg-white px-8 py-3 rounded-full shadow-lg"
              onPress={handleTryNow}
              activeOpacity={0.8}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              accessibilityRole="button"
              accessibilityLabel="Try Now Button"
            >
              <Text className="text-blue-900 font-bold text-lg text-center">Try Now</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animatable.View>

      {/* Features */}
      <View className="px-5 py-12">
        <Text className="text-3xl font-bold text-center text-blue-900 mb-2">What Makes DigiAiQuest Different</Text>
        <Text className="text-center text-gray-600 text-lg mb-10">Crafted to revolutionize how you learn and teach.</Text>

        {features.map((item, index) => (
          <Animatable.View
            key={index}
            animation={index % 2 === 0 ? "fadeInLeft" : "fadeInRight"}
            duration={700}
            delay={index * 200}
            className={`flex ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} items-center gap-5 bg-white rounded-2xl shadow-md p-5 mb-8`}
          >
            <Image
              source={item.image}
              className="w-[46%] h-36 rounded-xl"
              resizeMode="cover"
              accessibilityLabel={`${item.title} feature image`}
            />
            <View className="w-[54%]">
              <Text className="text-xl font-semibold text-blue-800 mb-1">{item.title}</Text>
              <Text className="text-gray-700 text-base leading-relaxed">{item.desc}</Text>
            </View>
          </Animatable.View>
        ))}
      </View>

      {/* Testimonials */}
      <Animatable.View animation="fadeInUp" duration={900} delay={300} className="px-5 py-12 bg-blue-50">
        <Text className="text-3xl font-bold text-center text-blue-900 mb-2">What Users Say</Text>
        <Text className="text-center text-gray-600 text-lg mb-8">Hear from our satisfied community</Text>

        <View style={{ height: 240 }}>
          <Carousel
            loop
            width={width - 40}
            height={240}
            autoPlay
            scrollAnimationDuration={1000}
            data={testimonials}
            onSnapToItem={setTestimonialIndex}
            renderItem={({ item }) => (
              <View className="bg-white px-6 py-5 rounded-2xl shadow-md border border-blue-100 mx-2 h-full justify-between">
                <Text className="text-5xl text-blue-200 leading-none mb-2">“</Text>
                <Text className="italic text-gray-700 text-[15px] leading-relaxed mb-3">{item.quote}</Text>
                <View>
                  <Text className="text-blue-800 font-bold text-base">{item.name}</Text>
                  <Text className="text-gray-500 text-sm">{item.role}</Text>
                </View>
              </View>
            )}
          />
          {/* Pagination dots */}
          <View className="flex-row justify-center mt-3">
            {testimonials.map((_, i) => (
              <View
                key={i}
                className={`mx-1 rounded-full ${i === testimonialIndex ? 'bg-blue-900' : 'bg-blue-300'}`}
                style={{ width: 8, height: 8 }}
              />
            ))}
          </View>
        </View>
      </Animatable.View>

      {/* Comparison Table */}
      <Animatable.View animation="fadeInUp" duration={900} delay={500} className="px-5 py-12 bg-white">
        <Text className="text-3xl font-bold text-center text-blue-900 mb-2">DigiAiQuest vs Others</Text>
        <Text className="text-center text-gray-600 text-lg mb-8">See how DigiAiQuest stands out</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="min-w-[740px]">
            <View className="flex-row bg-blue-100 rounded-t-2xl py-4 px-6 border border-blue-200">
              <Text className="w-[200px] font-semibold text-blue-900">Key Capability</Text>
              <Text className="w-[180px] text-center font-semibold text-blue-900">DigiAiQuest</Text>
              <Text className="w-[180px] text-center font-semibold text-blue-900">Other Platforms</Text>
              <Text className="w-[180px] text-center font-semibold text-blue-900">Other AI Quiz</Text>
            </View>
            {[
              { label: 'Academic Quiz Accuracy', values: ['99.9% Precision', '72% Accuracy', '65% Accuracy'] },
              { label: 'Subject-Specific Intelligence', values: ['Advanced Understanding', 'Moderate', 'Basic'] },
              { label: 'Textbook Integration', values: ['Complete Support', 'Partial', 'Limited'] },
              { label: 'Question Type Variety', values: ['High Range', 'Medium', 'Low'] },
              { label: 'Learning Outcome Focus', values: ['Academic Success', 'General Use', 'Limited Use'] },
            ].map((row, i) => (
              <View key={i} className={`flex-row py-5 px-6 border-b border-gray-200 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <Text className="w-[200px] text-gray-800">{row.label}</Text>
                <Text className="w-[180px] text-green-700 text-center font-medium">{row.values[0]}</Text>
                <Text className="w-[180px] text-gray-700 text-center">{row.values[1]}</Text>
                <Text className="w-[180px] text-gray-700 text-center">{row.values[2]}</Text>
              </View>
            ))}
            <View className="h-2 bg-blue-100 rounded-b-2xl" />
          </View>
        </ScrollView>
      </Animatable.View>

      {/* Why Choose Us */}
      <Animatable.View animation="fadeInUp" duration={900} delay={700} className="px-5 py-12 bg-blue-50">
        <Text className="text-3xl font-bold text-center text-blue-900 mb-2">Why Choose DigiAiQuest?</Text>
        <Text className="text-center text-gray-600 text-lg mb-8">Our commitment to excellence</Text>
        <View className="flex-row flex-wrap justify-between">
          {Object.entries(icons).map(([label, icon], i) => (
            <Animatable.View 
              key={i} 
              animation="zoomIn" 
              duration={600} 
              delay={800 + i * 100} 
              className="w-[48%] bg-white p-4 mb-4 rounded-xl border border-blue-100 shadow-md"
            >
              <View className="flex-row items-center mb-1">
                <Icon name={icon} size={22} color="#1e3a8a" />
                <Text className="ml-2 text-base font-semibold text-blue-900">{label}</Text>
              </View>
              <Text className="text-gray-700 text-sm">
                {{
                  Expertise: 'Years of experience in education technology.',
                  Affordability: 'Flexible pricing plans for all learners.',
                  Innovation: 'Smart, evolving AI-driven solutions.',
                  Reliability: 'Secure and dependable performance.',
                  'User-Centric': 'Built around your learning journey.',
                  Support: '24/7 guidance for smooth experience.'
                }[label]}
              </Text>
            </Animatable.View>
          ))}
        </View>
      </Animatable.View>
    </ScrollView>
  );
};

export default Home;
