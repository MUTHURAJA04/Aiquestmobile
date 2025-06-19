import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { generateQuiz } from '../services/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GenerateFromText = () => {
  const [text, setText] = useState('');
  const [questionType, setQuestionType] = useState('default');
  const [numberOfQuestions, setNumberOfQuestions] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        const user = JSON.parse(userString);
console.log(user);
        if (user) {
          setUserId(user.userId);
          setToken(user.token);
          console.log("userid",userId);
          console.log("token",token);
        } else {
          console.log('No user data found');
        }
      } catch (error) {
        console.error('Error reading user from AsyncStorage:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleGenerate = async () => {
    if (!text.trim()) return Alert.alert('Validation Error', 'Please paste the text.');
    if (questionType === 'default') return Alert.alert('Validation Error', 'Please select a question type.');
    if (!numberOfQuestions) return Alert.alert('Validation Error', 'Please select the number of questions.');
    if (!difficulty) return Alert.alert('Validation Error', 'Please select a difficulty level.');
    if (!userId || !token) return Alert.alert('Error', 'User not logged in.');

    setLoading(true); 
    try {
      const formData = {
        text,
        question_type: questionType,
        number_question: numberOfQuestions,
        difficulty,
        token,
      };

      const resData = await generateQuiz(userId, formData);
      console.log('✅ Quiz Generated:', resData);

      Alert.alert('Success', 'Quiz generated successfully!');
    } catch (error) {
      console.error('❌ Error generating quiz:', error);
      Alert.alert('Error', error.message || 'Quiz generation failed');
    } finally {
      setLoading(false); // ✅ Stop loading
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="px-6 py-8">
        <LinearGradient
          colors={['#3b82f6', '#9333ea']}
          style={{ borderRadius: 12, padding: 16, marginBottom: 24 }}
        >
          <Text className="text-3xl font-extrabold text-white text-center">
            Generate AI Quiz from Text
          </Text>
        </LinearGradient>

        <Text className="text-2xl font-bold text-blue-900 mb-4">Paste Text</Text>
        <TextInput
          placeholder="Paste your text, article, or paragraph here..."
          placeholderTextColor="black"
          value={text}
          onChangeText={setText}
          multiline
          numberOfLines={12}
          className="border border-gray-300 rounded-xl p-4 mb-4 text-gray-800 bg-gray-50 shadow-sm"
          textAlignVertical="top"
          style={{ minHeight: 200 }}
        />

        <Text className="font-medium text-gray-700 mb-2">Question Type</Text>
        <View className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm mb-4">
          <Picker
            selectedValue={questionType}
            onValueChange={(itemValue) => setQuestionType(itemValue)}
            style={{ height: 50, color: '#1f2937' }}
          >
            <Picker.Item label="Please Select Question Type" value="default" />
            <Picker.Item label="Multiple Choice" value="multiple" />
            <Picker.Item label="True / False" value="boolean" />
          </Picker>
        </View>

        <Text className="font-medium text-gray-700 mb-2">Number of Questions</Text>
        <View className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm mb-4">
          <Picker
            selectedValue={numberOfQuestions}
            onValueChange={(itemValue) => setNumberOfQuestions(itemValue)}
            style={{ height: 50, color: '#1f2937' }}
          >
            <Picker.Item label="Please Select No. of Questions" value="" />
            <Picker.Item label="5" value="5" />
            <Picker.Item label="10" value="10" />
            <Picker.Item label="15" value="15" />
          </Picker>
        </View>

        <Text className="font-medium text-gray-700 mb-2">Difficulty</Text>
        <View className="border border-gray-300 rounded-xl overflow-hidden bg-white shadow-sm mb-6">
          <Picker
            selectedValue={difficulty}
            onValueChange={(itemValue) => setDifficulty(itemValue)}
            style={{ height: 50, color: '#1f2937' }}
          >
            <Picker.Item label="Please Select Difficulty" value="" />
            <Picker.Item label="Easy" value="easy" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="Hard" value="hard" />
          </Picker>
        </View>

        {/* Submit Button or Loader */}
        {loading ? (
          <View className="py-4">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-center text-gray-500 mt-2">Generating Quiz...</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleGenerate}
            className="bg-blue-600 py-4 rounded-2xl items-center shadow-lg active:bg-blue-700"
          >
            <Text className="text-white font-bold text-lg tracking-wide">Generate Questions</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default GenerateFromText;
