import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { generateQuiz } from '../services/apiClient';

const GenerateFromText = () => {
  const navigation = useNavigation();
  const [text, setText] = useState('');
  const [questionType, setQuestionType] = useState('default');
  const [numberOfQuestions, setNumberOfQuestions] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load user credentials from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const user = JSON.parse(await AsyncStorage.getItem('user') || 'null');
        if (user?.userId && user?.token) {
          setUserId(user.userId);
          setToken(user.token);
        }
      } catch (err) {
        console.error('AsyncStorage read error:', err);
      }
    })();
  }, []);

  const handleGenerate = async () => {
    if (!text.trim()) return Alert.alert('Validation', 'Please paste the text.');
    if (questionType === 'default') return Alert.alert('Validation', 'Select a question type.');
    if (!numberOfQuestions) return Alert.alert('Validation', 'Select number of questions.');
    if (!difficulty) return Alert.alert('Validation', 'Select difficulty.');
    if (!userId || !token) return Alert.alert('Error', 'User not logged in.');

    setLoading(true);
    try {
      const payload = {
        text,
        question_type: questionType,
        number_question: Number(numberOfQuestions), // ensure number, matches backend param name
        difficulty,
        token,
      };

      console.log('📡 Sending →', payload);
      const res = await generateQuiz(userId, payload);
      console.log('✅ Quiz response:', res);

      Alert.alert('Success', 'Quiz generated successfully!');
      navigation.navigate('QuizAnswer', { quizData: res });
    } catch (err) {
      console.error('❌ Quiz error:', err);
      Alert.alert('Error', err.message || 'Quiz generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        style={{ width: '100%', padding: 16, marginBottom: 24 }}
        colors={['#3b82f6', '#a59ee8']}
      >
        <Text className="text-2xl font-extrabold text-white text-center">
          Generate AI Quiz from Text
        </Text>
      </LinearGradient>

      <ScrollView className="px-6 py-8" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Text Input */}
        <Text className="text-2xl font-bold text-blue-900 mb-4">Paste Text</Text>
        <TextInput
          placeholder="Paste your text, article, or paragraph here…"
          placeholderTextColor="#6b7280"
          value={text}
          onChangeText={setText}
          multiline
          className="border border-gray-300 rounded-xl p-4 mb-4 bg-gray-50 text-gray-800 shadow-sm"
          style={{ minHeight: 200 }}
          textAlignVertical="top"
        />

        {/* Question Type */}
        <Text className="font-medium text-gray-700 mb-2">Question Type</Text>
        <View className="border border-gray-300 rounded-xl bg-white shadow-sm mb-4 overflow-hidden">
          <Picker
            selectedValue={questionType}
            onValueChange={setQuestionType}
            style={{ height: 50, color: '#1f2937' }}
          >
            <Picker.Item label="Select Question Type" value="default" />
            <Picker.Item label="Multiple Choice" value="mcq" />
            <Picker.Item label="True / False" value="true_false" />
            <Picker.Item label="Both" value="both" />
          </Picker>
        </View>

        {/* Number of Questions */}
        <Text className="font-medium text-gray-700 mb-2">Number of Questions</Text>
        <View className="border border-gray-300 rounded-xl bg-white shadow-sm mb-4 overflow-hidden">
          <Picker
            selectedValue={numberOfQuestions}
            onValueChange={setNumberOfQuestions}
            style={{ height: 50, color: '#1f2937' }}
          >
            <Picker.Item label="Select number of questions" value="" />
            <Picker.Item label="5" value="5" />
            <Picker.Item label="10" value="10" />
            <Picker.Item label="15" value="15" />
            <Picker.Item label="20" value="20" />
            <Picker.Item label="25" value="25" />
          </Picker>
        </View>

        {/* Difficulty */}
        <Text className="font-medium text-gray-700 mb-2">Difficulty</Text>
        <View className="border border-gray-300 rounded-xl bg-white shadow-sm mb-6 overflow-hidden">
          <Picker
            selectedValue={difficulty}
            onValueChange={setDifficulty}
            style={{ height: 50, color: '#1f2937' }}
          >
            <Picker.Item label="Select Difficulty" value="" />
            <Picker.Item label="Easy" value="easy" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="Hard" value="hard" />
          </Picker>
        </View>

        {/* Submit Button */}
        {loading ? (
          <View className="py-4 items-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-gray-500 mt-2">Generating quiz…</Text>
          </View>
        ) : (
          <LinearGradient
            colors={['#3b82f6', '#33aaea']}
            style={{ borderRadius: 12, padding: 16, marginBottom: 24 }}
          >
            <TouchableOpacity onPress={handleGenerate} className="items-center">
              <Text className="text-white font-bold text-lg">Generate Questions</Text>
            </TouchableOpacity>
          </LinearGradient>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default GenerateFromText;
