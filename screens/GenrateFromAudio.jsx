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
  PermissionsAndroid,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { pick } from '@react-native-documents/picker';
import { generateQuiz } from '../services/apiClient';

const GenerateFromAudio = () => {
  const navigation = useNavigation();
  const [file, setFile] = useState(null);
  const [questionType, setQuestionType] = useState('mcq');
  const [numberOfQuestions, setNumberOfQuestions] = useState('5');
  const [difficulty, setDifficulty] = useState('medium');
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user?.userId && user?.token) {
          setUserId(user.userId);
          setToken(user.token);
        }
      }
    } catch (err) {
      console.error('AsyncStorage error:', err);
    }
  };

  const requestAudioPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const permission = Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

        const granted = await PermissionsAndroid.request(permission);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  const pickAudio = async () => {
    try {
      const hasPermission = await requestAudioPermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Audio file access permission is required.');
        return;
      }

      const result = await pick({ 
        type: ['audio/*'], 
        allowMultiSelection: false 
      });

      if (result && result.length > 0) {
        const selectedFile = result[0];

        if (selectedFile.size > 50 * 1024 * 1024) {
          Alert.alert(
            'Warning',
            'This is a large file. Generating questions may take longer.',
            [{ text: 'OK' }]
          );
        }

        setFile(selectedFile);
      }
    } catch (err) {
      if (err.code !== 'DOCUMENT_PICKER_CANCELED') {
        console.error('Document picker error:', err);
        Alert.alert('Error', 'Failed to open file picker. Please try again.');
      }
    }
  };

  const validateInputs = () => {
    if (!file) {
      Alert.alert('Missing File', 'Please upload an audio file first.');
      return false;
    }
    if (!questionType) {
      Alert.alert('Missing Selection', 'Please select a question type.');
      return false;
    }
    if (!numberOfQuestions) {
      Alert.alert('Missing Selection', 'Please select the number of questions.');
      return false;
    }
    if (!difficulty) {
      Alert.alert('Missing Selection', 'Please select difficulty level.');
      return false;
    }
    if (!userId || !token) {
      Alert.alert('Authentication Error', 'Please login again.');
      return false;
    }
    return true;
  };

const handleGenerate = async () => {
  if (!validateInputs()) return;

  setLoading(true);
  try {
    const formData = new FormData();
    formData.append('audio', {
      uri: file.uri,
      type: file.type || 'audio/mpeg',
      name: file.name || `audio_${Date.now()}.mp3`,
    });
    formData.append('question_type', questionType);
    formData.append('number_question', parseInt(numberOfQuestions));
    formData.append('difficulty', difficulty);
    formData.append('token', token);
    formData.append('language', 'en');

    console.log('📤 Sending audio request...');

    // ✅ Compress audio file first (if large)
    if (file.size > 10 * 1024 * 1024) { // 10MB
      Alert.alert(
        'Large File',
        'This audio file is large. Processing may take 1-2 minutes.',
        [{ text: 'Continue' }]
      );
    }

    // ✅ Add retry logic for network issues
    let retries = 3;
    let result;
    
    while (retries > 0) {
      try {
        result = await generateQuiz(userId, formData, true);
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        console.log(`Retrying... ${retries} attempts left`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      }
    }

    if (result.questions && result.questions.length > 0) {
      navigation.navigate('QuizAnswer', { quizData: result });
    } else {
      Alert.alert(
        'Generation Failed',
        'No questions could be generated from this audio.'
      );
    }

  } catch (error) {
    console.error('Audio quiz error:', error);
    
    // ✅ Better error messages for audio
    let errorMessage = 'Failed to process audio file. ';
    
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      errorMessage += 'The file is too large or taking too long. Try a smaller audio file.';
    } else if (error.message.includes('Network')) {
      errorMessage += 'Network issue detected. Please check your internet connection.';
    } else {
      errorMessage += error.message;
    }
    
    Alert.alert('Error', errorMessage);
  } finally {
    setLoading(false);
  }
};


  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView className="px-6 py-8" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <LinearGradient
          colors={['#3B82F6', '#6366F1']}
          style={{ borderRadius: 16, padding: 20, marginBottom: 24 }}
        >
          <Text className="text-2xl font-bold text-white text-center">
            Generate Quiz from Audio
          </Text>
          <Text className="text-blue-100 text-center mt-2 text-sm">
            Upload an audio file and we'll create questions for you
          </Text>
        </LinearGradient>

        {/* File Upload */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Audio File</Text>
          <TouchableOpacity
            onPress={pickAudio}
            disabled={loading}
            className={`py-4 px-6 rounded-xl mb-4 shadow-sm ${loading ? 'bg-gray-400' : 'bg-blue-500'}`}
          >
            <Text className="text-white text-center font-semibold text-base">
              {file ? 'Change Audio File' : 'Select Audio File'}
            </Text>
          </TouchableOpacity>

          {file && (
            <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <Text className="font-semibold text-gray-800 mb-2">Selected File:</Text>
              <Text className="text-gray-700 mb-1">📄 {file.name}</Text>
              <Text className="text-gray-600 mb-1">📁 {file.type || 'Unknown type'}</Text>
              <Text className="text-gray-600">📏 {formatFileSize(file.size)}</Text>
            </View>
          )}
        </View>

        {/* Question Type */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Question Type</Text>
          <View className="border border-gray-300 rounded-xl bg-white shadow-sm overflow-hidden">
            <Picker
              selectedValue={questionType}
              onValueChange={setQuestionType}
              enabled={!loading}
              style={{ height: 50, color: '#374151' }}
            >
              <Picker.Item label="Multiple Choice" value="mcq" />
              <Picker.Item label="True / False" value="true_false" />
              <Picker.Item label="Both" value="both" />
            </Picker>
          </View>
        </View>

        {/* Number of Questions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Number of Questions</Text>
          <View className="border border-gray-300 rounded-xl bg-white shadow-sm overflow-hidden">
            <Picker
              selectedValue={numberOfQuestions}
              onValueChange={setNumberOfQuestions}
              enabled={!loading}
              style={{ height: 50, color: '#374151' }}
            >
              <Picker.Item label="5" value="5" />
              <Picker.Item label="10" value="10" />
              <Picker.Item label="15" value="15" />
              <Picker.Item label="20" value="20" />
              <Picker.Item label="25" value="25" />
            </Picker>
          </View>
        </View>

        {/* Difficulty */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Difficulty Level</Text>
          <View className="border border-gray-300 rounded-xl bg-white shadow-sm overflow-hidden">
            <Picker
              selectedValue={difficulty}
              onValueChange={setDifficulty}
              enabled={!loading}
              style={{ height: 50, color: '#374151' }}
            >
              <Picker.Item label="Easy" value="easy" />
              <Picker.Item label="Medium" value="medium" />
              <Picker.Item label="Hard" value="hard" />
            </Picker>
          </View>
        </View>

        {/* Generate Button */}
        {loading ? (
          <View className="py-6 items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="text-gray-600 mt-3 text-center">
              Processing audio and generating questions...{'\n'}This may take 30-60 seconds
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleGenerate}
            disabled={loading || !file}
            className={`py-4 px-6 rounded-xl items-center bg-blue-500 ${!file ? 'opacity-50' : ''}`}
          >
            <Text className="text-white font-bold text-lg">
              Generate Quiz Questions
            </Text>
          </TouchableOpacity>
        )}

        {/* Tips */}
        <View className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
          <Text className="font-semibold text-blue-800 mb-2">💡 Tips for better results:</Text>
          <Text className="text-blue-700 text-sm leading-5">
            • Use MP3 or WAV format{'\n'}
            • Clear speech with minimal background noise{'\n'}
            • Files under 10 minutes work better{'\n'}
            • Start with 5 questions & Easy difficulty{'\n'}
            • Ensure good audio quality and volume
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default GenerateFromAudio;