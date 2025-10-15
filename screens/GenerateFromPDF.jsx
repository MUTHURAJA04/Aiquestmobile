import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { pick } from '@react-native-documents/picker';
import { generateQuiz } from '../services/apiClient';

const GenerateFromPDF = () => {
  const navigation = useNavigation();
  const [file, setFile] = useState(null);
  const [questionType, setQuestionType] = useState('mcq');
  const [numberOfQuestions, setNumberOfQuestions] = useState('5');
  const [difficulty, setDifficulty] = useState('medium');
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          const parsedUser = JSON.parse(user);
          setUserId(parsedUser.userId);
          setToken(parsedUser.token);
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to load user data');
      }
    };
    loadUser();
  }, []);

  const pickDocument = async () => {
    try {
      const [selected] = await pick({
        type: ['application/pdf'],
        allowMultiSelection: false,
      });

      if (selected) {
        setFile(selected);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to select document');
    }
  };

  const handleGenerate = async () => {
    if (!file) {
      Alert.alert('Error', 'Please select a PDF file');
      return;
    }
    if (!userId || !token) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    setLoading(true);
    try {
      // ✅ EXACT SAME as web FormData structure
      const formData = new FormData();
      formData.append('pdf', {
        uri: file.uri,
        type: file.type || 'application/pdf',
        name: file.name || 'document.pdf',
      });
      formData.append('question_type', questionType);
      formData.append('number_question', parseInt(numberOfQuestions));
      formData.append('difficulty', difficulty);
      formData.append('token', token);
      formData.append('language', 'en'); // ✅ Same as web

      console.log('📤 Sending FormData matching web structure');

      const result = await generateQuiz(userId, formData, true);

      // ✅ EXACT SAME navigation as web
      navigation.navigate('QuizAnswer', { 
        quizData: result 
      });

    } catch (error) {
      console.error('Quiz generation error:', error);
      Alert.alert('Error', error.message || 'Quiz generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <LinearGradient 
        colors={['#2563eb', '#4f46e5']} 
        className="p-5 mb-5"
      >
        <Text className="text-xl font-bold text-white text-center">
          Generate Quiz from PDF
        </Text>
      </LinearGradient>

      <ScrollView contentContainerClassName="px-5 pb-10">
        {/* File Upload */}
        <TouchableOpacity
          onPress={pickDocument}
          className="bg-blue-600 p-4 rounded-lg mb-4"
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold">
            {file ? 'Change PDF' : 'Select PDF'}
          </Text>
        </TouchableOpacity>

        {file && (
          <View className="bg-gray-50 rounded-lg p-4 mb-5">
            <Text className="font-bold text-gray-900">
              Selected: {file.name}
            </Text>
          </View>
        )}

        {/* Settings - Same as web */}
        <View className="mb-5">
          <Text className="font-semibold mb-2">Question Type</Text>
          <View className="border border-gray-300 rounded-lg mb-5 bg-white">
            <Picker
              selectedValue={questionType}
              onValueChange={setQuestionType}
              style={{ height: 50 }}
            >
              <Picker.Item label="Multiple Choice" value="mcq" />
              <Picker.Item label="True/False" value="true_false" />
              <Picker.Item label="Both" value="both" />
            </Picker>
          </View>

          <Text className="font-semibold mb-2">Number of Questions</Text>
          <View className="border border-gray-300 rounded-lg mb-5 bg-white">
            <Picker
              selectedValue={numberOfQuestions}
              onValueChange={setNumberOfQuestions}
              style={{ height: 50 }}
            >
              <Picker.Item label="5" value="5" />
              <Picker.Item label="10" value="10" />
              <Picker.Item label="15" value="15" />
              <Picker.Item label="20" value="20" />
              <Picker.Item label="25" value="25" />
            </Picker>
          </View>

          <Text className="font-semibold mb-2">Difficulty</Text>
          <View className="border border-gray-300 rounded-lg mb-5 bg-white">
            <Picker
              selectedValue={difficulty}
              onValueChange={setDifficulty}
              style={{ height: 50 }}
            >
              <Picker.Item label="Easy" value="easy" />
              <Picker.Item label="Medium" value="medium" />
              <Picker.Item label="Hard" value="hard" />
            </Picker>
          </View>
        </View>

        {loading ? (
          <View className="p-5 items-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="mt-2 text-gray-600">Processing PDF...</Text>
          </View>
        ) : (
          <TouchableOpacity 
            onPress={handleGenerate}
            disabled={!file || loading}
            className="bg-blue-600 p-4 rounded-lg"
          >
            <Text className="text-white text-center font-semibold">
              Generate Quiz
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

export default GenerateFromPDF;