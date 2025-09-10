


import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
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
  const [fileInfo, setFileInfo] = useState('');
  const [isTextBased, setIsTextBased] = useState(true); // Assume text-based by default

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
        console.error('AsyncStorage error:', err);
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
        copyTo: 'cachesDirectory',
      });

      if (selected) {
        // Basic validation
        if (selected.size < 5120) { // At least 5KB
          Alert.alert('Invalid Document', 'The PDF appears to be too small (minimum 5KB required).');
          return;
        }

        if (selected.size > 3 * 1024 * 1024) { // Max 3MB
          Alert.alert('Invalid Document', 'Please select a PDF smaller than 3MB.');
          return;
        }

        // Check if filename suggests it might be a resume
        const isLikelyResume = selected.name.toLowerCase().includes('resume') || 
                              selected.name.toLowerCase().includes('cv');
        
        if (isLikelyResume) {
          Alert.alert(
            'Resume Detected',
            'Note: Resumes typically don\'t work well for quiz generation. ' +
            'For best results, use documents with paragraphs of text like articles or reports.',
            [
              { text: 'Use Anyway', onPress: () => processSelectedFile(selected, true) },
              { text: 'Choose Different', onPress: () => {} }
            ]
          );
        } else {
          processSelectedFile(selected, false);
        }
      }
    } catch (err) {
      console.log('Document pick error:', err);
      Alert.alert('Error', 'Failed to select document. Please try again.');
    }
  };

  const processSelectedFile = (selected, isResume) => {
    setFile(selected);
    setFileInfo(`${selected.name} (${Math.round(selected.size / 1024)} KB)`);
    setIsTextBased(!isResume); // Assume resumes might be image-based
    console.log('Selected document:', selected);
  };

  const validateDocument = () => {
    if (!file) {
      Alert.alert('Error', 'Please upload a PDF document.');
      return false;
    }

    if (file.size < 5120) {
      Alert.alert('Error', 'The document must be at least 5KB in size.');
      return false;
    }

    if (file.size > 3 * 1024 * 1024) {
      Alert.alert('Error', 'Document is too large. Please select a file under 3MB.');
      return false;
    }

    return true;
  };

  const handleGenerate = async () => {
    if (!validateDocument()) return;
    if (!userId || !token) {
      Alert.alert('Error', 'User not logged in.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('Document', {
        uri: file.uri,
        type: file.type,
        name: file.name || `document_${Date.now()}.pdf`,
      });

      // Adjust parameters based on document type
      const adjustedParams = {
        questionType: isTextBased ? questionType : 'mcq', // Force MCQ for resumes
        numberOfQuestions: isTextBased ? numberOfQuestions : Math.min(parseInt(numberOfQuestions), 5),
        difficulty: isTextBased ? difficulty : 'easy' // Force easy for resumes
      };

      formData.append('question_type', adjustedParams.questionType);
      formData.append('number_question', adjustedParams.numberOfQuestions);
      formData.append('difficulty', adjustedParams.difficulty);
      formData.append('token', token);
      formData.append('file_size', file.size);

      console.log('Submitting with adjusted params:', adjustedParams);

      const res = await generateQuiz(userId, formData, true);

      if (!res.questions || res.questions.length === 0) {
        throw new Error('API failed to generate questions from this document.');
      }

      navigation.navigate('QuizAnswer', { 
        quizData: res,
        sourceInfo: `Generated from: ${file.name}`,
      });
    } catch (error) {
      console.error('Quiz generation error:', error);
      
      let errorMessage = 'Failed to generate questions from this document.';
      const detailedMessage = error.response?.data?.error || error.message;
      
      if (detailedMessage.includes('Only 0 out of') || 
          detailedMessage.includes('not contain enough text')) {
        errorMessage = [
          'The document could not be processed. Common reasons:',
          '',
          '1. The PDF contains images/scans without selectable text',
          '2. The content is too short or formatted unusually',
          '3. The text language might not be supported',
          '4. The document is a resume/CV (which rarely works)',
          '',
          'Recommended solutions:',
          '• Try a textbook chapter, article, or report instead',
          '• Use a PDF with clear paragraphs of text',
          '• Reduce the number of questions',
          '• Set difficulty to "Easy"'
        ].join('\n');
      }
      
      Alert.alert('Generation Failed', errorMessage);
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
        colors={['#2563eb', '#4f46e5']} 
        className="p-5 mb-5"
      >
        <Text className="text-xl font-bold text-white text-center">
          Generate Quiz from PDF
        </Text>
      </LinearGradient>

      <ScrollView 
        contentContainerClassName="px-5 pb-10"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-gray-600 mb-4 text-center">
          For best results, use text-heavy PDFs like articles, reports, or textbook chapters.
        </Text>

        {/* Document Upload */}
        <TouchableOpacity
          onPress={pickDocument}
          className={`bg-blue-600 p-4 rounded-lg mb-4 ${loading ? 'opacity-60' : 'opacity-100'}`}
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold">
            {file ? 'Change PDF Document' : 'Select PDF Document'}
          </Text>
        </TouchableOpacity>

        {file && (
          <View className="bg-gray-50 rounded-lg p-4 mb-5 border border-gray-200">
            <Text className="font-bold mb-1 text-gray-900">
              Selected Document:
            </Text>
            <Text className="text-gray-700">{fileInfo}</Text>
            {file.name.toLowerCase().includes('resume') && (
              <Text className="text-yellow-600 mt-2">
                Note: Resumes often don't work well for quiz generation
              </Text>
            )}
          </View>
        )}

        {/* Settings Section */}
        <View className="mb-5">
          <Text className="font-semibold mb-2 text-gray-900">
            Question Type
          </Text>
          <View className="border border-gray-300 rounded-lg mb-5 bg-white">
            <Picker
              selectedValue={questionType}
              onValueChange={setQuestionType}
              style={{ height: 50, color: '#212529' }}
              enabled={!loading}
            >
              <Picker.Item label="Multiple Choice" value="mcq" />
              <Picker.Item label="True/False" value="true_false" />
              <Picker.Item label="Both Types" value="both" />
            </Picker>
          </View>

          <Text className="font-semibold mb-2 text-gray-900">
            Number of Questions
          </Text>
          <View className="border border-gray-300 rounded-lg mb-5 bg-white">
            <Picker
              selectedValue={numberOfQuestions}
              onValueChange={setNumberOfQuestions}
              style={{ height: 50, color: '#212529' }}
              enabled={!loading}
            >
              <Picker.Item label="5" value="5" />
              <Picker.Item label="10" value="10" />
              <Picker.Item label="15" value="15" />
              <Picker.Item label="20" value="20" />
              <Picker.Item label="25" value="25" />

            </Picker>
          </View>

          <Text className="font-semibold mb-2 text-gray-900">
            Difficulty Level
          </Text>
          <View className="border border-gray-300 rounded-lg mb-5 bg-white">
            <Picker
              selectedValue={difficulty}
              onValueChange={setDifficulty}
              style={{ height: 50, color: '#212529' }}
              enabled={!loading}
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
            <Text className="mt-2 text-gray-600 text-center">
              Processing document...{'\n'}
              This may take 30-60 seconds for larger files.
            </Text>
          </View>
        ) : (
          <TouchableOpacity 
            onPress={handleGenerate}
            disabled={!file || loading}
            className={`bg-blue-600 p-4 rounded-lg ${!file ? 'opacity-60' : 'opacity-100'}`}
          >
            <Text className="text-white text-center font-semibold text-base">
              Generate Quiz
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default GenerateFromPDF;



