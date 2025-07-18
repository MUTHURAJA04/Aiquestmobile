import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { getPlans } from '../services/apiClient';

const faqs = [
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, UPI, net banking, and PayPal for international payments.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel anytime. We offer prorated refunds for unused time in your billing period.',
  },
  {
    question: 'Do you offer student discounts?',
    answer: 'We offer 30% discounts for students with valid .edu email addresses. Contact our support team to verify.',
  },
  {
    question: 'How secure is my payment information?',
    answer: 'We use industry-standard encryption and never store your full payment details on our servers.',
  },
];

const Pricing = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const data = await getPlans();
        setPlans(data);
      } catch (err) {
        console.error('Error loading plans:', err);
        setError('Failed to load plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text>Loading plans...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="bg-gray-50">

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


{/* Plans Grid */}
<View className="px-4 py-8">
  <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">Choose Your Plan</Text>
  
  <View className="flex-row flex-wrap justify-center" style={{ gap: 20 }}>
    {plans.map((plan, index) => (
      <View 
        key={index} 
        className="rounded-2xl overflow-hidden w-full max-w-md border border-gray-200 bg-white"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <LinearGradient 
          colors={plan.gradient || ['#f8fafc', '#e2e8f0']}
          className="p-6"
          start={{ x: 0, y: 0 }} 
          end={{ x: 1, y: 1 }}
        >
          {/* Plan Header */}
          <View className="mb-4">
            <Text className="text-xl font-bold text-gray-900">{plan.name}</Text>
            <View className="flex-row items-end mt-1">
              <Text className="text-3xl font-extrabold text-gray-900">
                ₹{plan.base_price}
              </Text>
              <Text className="text-gray-600 ml-1 mb-1">
                /{plan.duration_days === 30 ? 'month' : plan.duration_days === 365 ? 'year' : `${plan.duration_days} days`}
              </Text>
            </View>
          </View>
          
          {/* Features List */}
          <View className="border-t border-gray-200 pt-4">
            {plan.features?.map((feature, i) => (
              <View key={i} className="flex-row items-start mb-3">
                <Icon name="check-circle" size={18} color="#10b981" style={{ marginTop: 2 }} />
                <Text className="ml-2 text-gray-700 flex-1">{feature}</Text>
              </View>
            ))}
          </View>
          
          {/* CTA Button */}
          <TouchableOpacity 
            className="mt-6 rounded-xl py-3 bg-blue-500"
            activeOpacity={0.8}
            style={{
              shadowColor: '#3b82f6',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text className="text-center text-white font-semibold text-lg">
              {plan.cta || 'Get Started'}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    ))}
  </View>
</View>

      {/* Comparison Table */}
      <View className="px-4 py-8 bg-white">
        <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">Plan Comparison</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="rounded-xl border border-gray-300 overflow-hidden min-w-[700px]">
            {/* Table Header */}
            <View className="flex-row bg-gray-200 border-b border-gray-300">
              <View className="w-2/5 p-4 justify-center">
                <Text className="text-base font-semibold text-gray-800">Features</Text>
              </View>
              <View className="w-1/5 p-4 justify-center items-center">
                <Text className="text-base font-semibold text-gray-800">Free</Text>
              </View>
              <View className="w-1/5 p-4 justify-center items-center">
                <Text className="text-base font-semibold text-gray-800">Basic</Text>
              </View>
              <View className="w-1/5 p-4 justify-center items-center">
                <Text className="text-base font-semibold text-gray-800">Premium</Text>
              </View>
            </View>

            {/* Table Rows */}
            {[
              ['Quiz Attempts', '3', 'Unlimited', 'Unlimited'],
              ['Questions/Day', '5', '20', '100'],
              ['Support', 'Community', 'Email', '24/7'],
              ['Analytics', 'Basic', 'Advanced', 'Advanced'],
              ['Custom Templates', '✕', '✕', '✓'],
            ].map((row, rowIndex) => (
              <View
                key={rowIndex}
                className={`flex-row ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200`}
              >
                {row.map((cell, cellIndex) => (
                  <View
                    key={cellIndex}
                    className={`${cellIndex === 0 ? 'w-2/5' : 'w-1/5'} p-4 ${cellIndex === 0 ? 'justify-start' : 'justify-center items-center'}`}
                  >
                    <Text className="text-base text-gray-700">{cell}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Enterprise Section */}
      <LinearGradient 
        colors={['#1e40af', '#2563eb']}
        className="mx-4 my-8 p-8 rounded-2xl overflow-hidden"
      >
        <Text className="text-white text-2xl font-bold mb-2">Need Enterprise Solutions?</Text>
        <Text className="text-blue-100 mb-6 leading-6">
          Custom plans for schools, universities, and businesses with volume discounts and dedicated support.
        </Text>
        <TouchableOpacity 
          className="bg-white rounded-xl py-3 px-6 self-start"
          activeOpacity={0.8}
        >
          <Text className="text-blue-600 font-semibold text-lg">Contact Sales</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* FAQs */}
      <View className="px-4 py-10 bg-white">
        <Text className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Frequently Asked Questions
        </Text>

        <View className="gap-2">
          {faqs.map((faq, i) => (
            <View
              key={i}
              className="bg-white rounded-2xl border border-gray-200"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <TouchableOpacity
                className="flex-row justify-between items-center px-5 py-4 bg-gray-100 rounded-t-2xl"
                onPress={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                activeOpacity={0.8}
              >
                <Text className="text-gray-900 font-semibold text-base flex-1 pr-4">
                  {faq.question}
                </Text>
                <Icon
                  name={openFaqIndex === i ? 'minus' : 'plus'}
                  size={24}
                  color="#3b82f6"
                />
              </TouchableOpacity>

              {openFaqIndex === i && (
                <View className="px-5 py-4 bg-white rounded-b-2xl border-t border-gray-200">
                  <Text className="text-gray-700 text-sm leading-relaxed">
                    {faq.answer}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* CTA Section */}
      <View className="relative overflow-hidden rounded-t-3xl mt-12">
        <LinearGradient
          colors={['#1e3a8a', '#1e40af', '#accafa']}
          className="px-6 py-16"
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        >
          <View className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-blue-400 opacity-20" />
          <View className="absolute -left-20 -bottom-20 w-60 h-60 rounded-full bg-blue-500 opacity-20" />
          
          <View className="z-10">
            <Text className="text-white text-3xl font-bold mb-4 text-center">
              Still have questions?
            </Text>
            <Text className="text-blue-100 text-lg text-center mb-8 max-w-2xl mx-auto leading-6">
              Our team is here to help you choose the right plan for your needs.
            </Text>

            <View className="flex-row justify-center space-x-4">
              <TouchableOpacity
                className="rounded-xl overflow-hidden"
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#ffffff', '#e0e7ff']}
                  className="py-4 px-8 rounded-xl"
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                >
                  <Text className="text-blue-600 font-bold text-center text-lg">
                    Contact Support
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    </ScrollView>
  );
};

export default Pricing;