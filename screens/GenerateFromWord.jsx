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
       
        Alert.alert('Oops!', 'Failed to load user data');
      }
    };
    loadUser();
  }, []);

  const detectDocumentType = (filename) => {
    const lowerName = filename.toLowerCase();
    if (lowerName.includes('resume') || lowerName.includes('cv')) return 'resume';
    if (lowerName.includes('essay') || lowerName.includes('article')) return 'essay';
    if (lowerName.includes('report') || lowerName.includes('paper')) return 'report';
    return 'general';
  };

  const pickDocument = async () => {
    try {
      const [selected] = await pick({
        type: [
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
        ],
        allowMultiSelection: false,
        copyTo: 'cachesDirectory',
      });

      if (selected) {
        if (selected.size < 3072) {
          Alert.alert('Invalid Document', 'The document appears to be too small (minimum 3KB required).');
          return;
        }
        if (selected.size > 2 * 1024 * 1024) {
          Alert.alert('Invalid Document', 'Please select a document smaller than 2MB.');
          return;
        }

        const docType = detectDocumentType(selected.name);
        setDocumentType(docType);

        if (docType === 'resume') {
          Alert.alert(
            'Resume Detected',
            'Resumes typically don\'t generate good quiz questions. Use essays or reports for best results.',
            [
              { text: 'Use Anyway', onPress: () => processSelectedFile(selected, docType) },
              { text: 'Choose Different', onPress: () => {} },
            ]
          );
          return;
        }

        processSelectedFile(selected, docType);
      }
    } catch (err) {
   
      Alert.alert('Error', 'Failed to select document. Please try again.');
    }
  };

  const processSelectedFile = (selected, type) => {
    setFile(selected);
    setFileInfo(`${selected.name} (${Math.round(selected.size / 1024)} KB)`);
 
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

  // ✅ Fix: Use the user-selected number, only limit for very tiny docs or resumes
const getSafeGenerationParams = () => ({
  questionType,
  numberOfQuestions: parseInt(numberOfQuestions),
  difficulty,
});

const handleGenerate = async () => {
  if (!validateDocument()) return;
  if (!userId || !token) {
    Alert.alert('Error', 'User not logged in.');
    return;
  }

  setLoading(true);
  try {
    const formData = new FormData();
    
    // ✅ FIX: Use 'word' instead of 'Document' to match your web version
    formData.append('word', {
      uri: file.uri,
      type: file.type,
      name: file.name || `document_${Date.now()}.docx`,
    });

    const params = getSafeGenerationParams();
    formData.append('question_type', params.questionType);
    formData.append('number_question', params.numberOfQuestions);
    formData.append('difficulty', params.difficulty);
    formData.append('token', token);
    formData.append('language', 'en'); // ✅ Add language parameter



    const res = await generateQuiz(userId, formData, true);
    
  

    // ✅ SIMPLIFIED: Just check if we have questions
    if (res.questions && res.questions.length > 0) {
      navigation.navigate('QuizAnswer', {
        quizData: res,
        sourceInfo: `Generated from: ${file.name}`,
      });
    } else {
      Alert.alert(
        'No Questions Generated',
        'Could not generate questions from this document.\n\nTry:\n• Different Word document\n• Fewer questions (5-10)\n• Easier difficulty\n• Documents with more text content'
      );
    }

  } catch (error) {
   
    Alert.alert(
      'Generation Failed',
      error.message || 'Something went wrong while generating the quiz.'
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#2563eb', '#4f46e5']} className="p-5 mb-5">
        <Text className="text-xl font-bold text-white text-center">Generate Quiz from Word Document</Text>
      </LinearGradient>

      <ScrollView contentContainerClassName="px-5 pb-10" keyboardShouldPersistTaps="handled">
        <Text className="text-gray-600 mb-4 text-center">
          Best results with documents containing several paragraphs of text. Avoid resumes, forms, or heavily formatted documents.
        </Text>

        <TouchableOpacity onPress={pickDocument} className={`bg-blue-600 p-4 rounded-lg mb-4 ${loading ? 'opacity-60' : 'opacity-100'}`} disabled={loading}>
          <Text className="text-white text-center font-semibold">
            {file ? 'Change Word Document' : 'Select Word Document'}
          </Text>
        </TouchableOpacity>

        {file && (
          <View className="bg-gray-50 rounded-lg p-4 mb-5 border border-gray-200">
            <Text className="font-bold mb-1 text-gray-900">Selected Document:</Text>
            <Text className="text-gray-700">{fileInfo}</Text>
            {documentType === 'resume' && (
              <Text className="text-yellow-600 mt-2">Warning: Resumes rarely generate good quiz questions</Text>
            )}
          </View>
        )}

        {/* Settings Section */}
        <View className="mb-5">
          <Text className="font-semibold mb-2 text-gray-900">Question Type</Text>
          <View className="border border-gray-300 rounded-lg mb-5 bg-white">
            <Picker selectedValue={questionType} onValueChange={setQuestionType} style={{ height: 50, color: '#212529' }} enabled={!loading}>
              <Picker.Item label="Multiple Choice" value="mcq" />
              <Picker.Item label="True/False" value="true_false" />
              <Picker.Item label="Both" value="both" />
            </Picker>
          </View>

          <Text className="font-semibold mb-2 text-gray-900">Number of Questions</Text>
          <View className="border border-gray-300 rounded-lg mb-5 bg-white">
            <Picker selectedValue={numberOfQuestions} onValueChange={setNumberOfQuestions} style={{ height: 50, color: '#212529' }} enabled={!loading}>
              <Picker.Item label="5" value="5" />
              <Picker.Item label="10" value="10" />
              <Picker.Item label="15" value="15" />
              <Picker.Item label="20" value="20" />
              <Picker.Item label="25" value="25" />
            </Picker>
          </View>

          <Text className="font-semibold mb-2 text-gray-900">Difficulty Level</Text>
          <View className="border border-gray-300 rounded-lg mb-5 bg-white">
            <Picker selectedValue={difficulty} onValueChange={setDifficulty} style={{ height: 50, color: '#212529' }} enabled={!loading}>
              <Picker.Item label="Easy" value="easy" />
              <Picker.Item label="Medium" value="medium" />
              <Picker.Item label="Hard" value="hard" />
            </Picker>
          </View>
        </View>

        {loading ? (
          <View className="p-5 items-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="mt-2 text-gray-600 text-center">Analyzing document content...{'\n'}This typically takes 20-40 seconds.</Text>
          </View>
        ) : (
          <TouchableOpacity onPress={handleGenerate} disabled={!file || loading} className={`bg-blue-600 p-4 rounded-lg ${!file ? 'opacity-60' : 'opacity-100'}`}>
            <Text className="text-white text-center font-semibold text-base">Generate Quiz</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default GenerateFromWord;
