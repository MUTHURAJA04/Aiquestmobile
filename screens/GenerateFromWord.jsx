


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

const GenerateFromWord = () => {
  const navigation = useNavigation();
  const [file, setFile] = useState(null);
  const [questionType, setQuestionType] = useState('mcq');
  const [numberOfQuestions, setNumberOfQuestions] = useState('5');
  const [difficulty, setDifficulty] = useState('medium');
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState('');
  const [documentType, setDocumentType] = useState('unknown');

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

  const detectDocumentType = (filename) => {
    const lowerName = filename.toLowerCase();
    if (lowerName.includes('resume') || lowerName.includes('cv')) {
      return 'resume';
    }
    if (lowerName.includes('essay') || lowerName.includes('article')) {
      return 'essay';
    }
    if (lowerName.includes('report') || lowerName.includes('paper')) {
      return 'report';
    }
    return 'general';
  };

  const pickDocument = async () => {
    try {
      const [selected] = await pick({
        type: [
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword'
        ],
        allowMultiSelection: false,
        copyTo: 'cachesDirectory',
      });

      if (selected) {
        // Enhanced validation
        if (selected.size < 3072) { // At least 3KB
          Alert.alert('Invalid Document', 'The document appears to be too small (minimum 3KB required).');
          return;
        }

        if (selected.size > 2 * 1024 * 1024) { // Max 2MB
          Alert.alert('Invalid Document', 'Please select a document smaller than 2MB.');
          return;
        }

        const docType = detectDocumentType(selected.name);
        setDocumentType(docType);

        if (docType === 'resume') {
          Alert.alert(
            'Resume Detected',
            'Resumes typically don\'t generate good quiz questions. ' +
            'For best results, use documents with paragraphs of text like essays or reports.',
            [
              { 
                text: 'Use Anyway', 
                onPress: () => processSelectedFile(selected, docType) 
              },
              { text: 'Choose Different', onPress: () => {} }
            ]
          );
          return;
        }

        processSelectedFile(selected, docType);
      }
    } catch (err) {
      console.log('Document pick error:', err);
      Alert.alert('Error', 'Failed to select document. Please try again.');
    }
  };

  const processSelectedFile = (selected, type) => {
    setFile(selected);
    setFileInfo(`${selected.name} (${Math.round(selected.size / 1024)} KB)`);
    console.log('Selected document:', {
      uri: selected.uri,
      name: selected.name,
      type: selected.type,
      size: selected.size,
      documentType: type
    });
  };

  const validateDocument = () => {
    if (!file) {
      Alert.alert('Error', 'Please upload a Word document.');
      return false;
    }

    if (file.size < 3072) {
      Alert.alert('Error', 'The document must be at least 3KB in size.');
      return false;
    }

    if (file.size > 2 * 1024 * 1024) {
      Alert.alert('Error', 'Document is too large. Please select a file under 2MB.');
      return false;
    }

    return true;
  };

  const getOptimalGenerationParams = () => {
    switch(documentType) {
      case 'resume':
        return {
          questionType: 'mcq',
          numberOfQuestions: Math.min(parseInt(numberOfQuestions), 5),
          difficulty: 'easy'
        };
      case 'essay':
      case 'report':
        return {
          questionType: questionType,
          numberOfQuestions: numberOfQuestions,
          difficulty: difficulty
        };
      default:
        return {
          questionType: 'mcq',
          numberOfQuestions: Math.min(parseInt(numberOfQuestions), 10),
          difficulty: 'medium'
        };
    }
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
        name: file.name || `document_${Date.now()}.docx`,
      });

      const optimalParams = getOptimalGenerationParams();
      
      formData.append('question_type', optimalParams.questionType);
      formData.append('number_question', optimalParams.numberOfQuestions);
      formData.append('difficulty', optimalParams.difficulty);
      formData.append('token', token);
      formData.append('file_size', file.size);

      console.log('Submitting with optimized parameters:', optimalParams);

      const res = await generateQuiz(userId, formData, true);

      if (!res.questions || res.questions.length === 0) {
        throw new Error('The document content could not be processed into questions.');
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
          'Content could not be processed. Common issues:',
          '',
          '1. Document contains mostly formatting/tables rather than paragraphs',
          '2. Text is in images or non-standard formatting',
          '3. Language might not be supported',
          '4. Document is too short or contains mostly lists',
          '',
          'Recommended solutions:',
          '• Try documents with several paragraphs of text',
          '• Use essays, articles, or reports instead of resumes',
          '• Reduce number of questions and use easier difficulty',
          '',
          `Document type detected: ${documentType}`
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
          Generate Quiz from Word Document
        </Text>
      </LinearGradient>

      <ScrollView 
        contentContainerClassName="px-5 pb-10"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-gray-600 mb-4 text-center">
          Best results with documents containing several paragraphs of text.
          Avoid resumes, forms, or heavily formatted documents.
        </Text>

        {/* Document Upload */}
        <TouchableOpacity
          onPress={pickDocument}
          className={`bg-blue-600 p-4 rounded-lg mb-4 ${loading ? 'opacity-60' : 'opacity-100'}`}
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold">
            {file ? 'Change Word Document' : 'Select Word Document'}
          </Text>
        </TouchableOpacity>

        {file && (
          <View className="bg-gray-50 rounded-lg p-4 mb-5 border border-gray-200">
            <Text className="font-bold mb-1 text-gray-900">
              Selected Document:
            </Text>
            <Text className="text-gray-700">{fileInfo}</Text>
            {documentType === 'resume' && (
              <Text className="text-yellow-600 mt-2">
                Warning: Resumes rarely generate good quiz questions
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
              Analyzing document content...{'\n'}
              This typically takes 20-40 seconds.
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

export default GenerateFromWord;