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
import { pick } from '@react-native-documents/picker';   // ✅ Correct import

import { generateQuiz } from '../services/apiClient';

const GenerateFromAudio = () => {
  const navigation = useNavigation();
  const [file, setFile] = useState(null);
  const [questionType, setQuestionType] = useState('default');
  const [numberOfQuestions, setNumberOfQuestions] = useState('');
  const [difficulty, setDifficulty] = useState('');
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
        } else {
          console.warn('⚠️ Incomplete user data found');
        }
      } else {
        console.warn('⚠️ No user data found in AsyncStorage');
      }
    } catch (err) {
      console.error('❌ AsyncStorage error:', err);
      Alert.alert('Error', 'Failed to load user data. Please login again.');
    }
  };

  const requestAudioPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const permission = Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

        const granted = await PermissionsAndroid.request(permission, {
          title: 'Audio Permission Required',
          message: 'This app needs access to your audio files to generate quizzes.',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        });

        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('❌ Permission request error:', err);
        return false;
      }
    }
    return true;
  };

  const pickAudio = async () => {
    console.log(' Starting audio picker...');

    try {
      const hasPermission = await requestAudioPermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Audio file access permission is required to select files.',
          [{ text: 'OK' }]
        );
        return;
      }

      const result = await pick({
        type: ['audio/*'],   // ✅ Correct usage
      });

      if (result && result.length > 0) {
        const selectedFile = result[0];
        console.log(' Audio file selected:', selectedFile);

        // Validate file size (max 50MB)
        const maxSize = 50 * 1024 * 1024;
        if (selectedFile.size > maxSize) {
          Alert.alert(
            'File Too Large',
            'Please select an audio file smaller than 50MB.',
            [{ text: 'OK' }]
          );
          return;
        }

        setFile(selectedFile);
      }
    } catch (err) {
      if (err.code === 'DOCUMENT_PICKER_CANCELED') {
        console.log(' User cancelled audio picker');
      } else {
        console.error(' Document picker error:', err);
        Alert.alert(
          'Error',
          'Failed to open file picker. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const validateInputs = () => {
    if (!file) {
      Alert.alert('Missing File', 'Please upload an audio file first.');
      return false;
    }
    if (questionType === 'default') {
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
      Alert.alert(
        'Authentication Error',
        'You need to be logged in to generate quizzes. Please login again.',
        [
          { text: 'Cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') }
        ]
      );
      return false;
    }
    return true;
  };

  const createFormData = () => {
    const formData = new FormData();
    const fileData = {
      uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
      type: file.type || 'audio/mpeg',
      name: file.name || `audio_${Date.now()}.mp3`,
    };

    console.log(' Preparing file for upload:', fileData);

    formData.append('Audio', fileData);
    formData.append('question_type', questionType);
    formData.append('number_question', numberOfQuestions);
    formData.append('difficulty', difficulty);
    formData.append('token', token);

    return formData;
  };

  const handleGenerate = async () => {
    if (!validateInputs()) {
      return;
    }
    setLoading(true);

    try {
      console.log(' Starting quiz generation...');
      const formData = createFormData();
      const response = await generateQuiz(userId, formData, true);

      console.log(' Quiz generated successfully:', response);

      Alert.alert(
        'Success!',
        'Your quiz has been generated successfully.',
        [
          {
            text: 'Start Quiz',
            onPress: () => navigation.navigate('QuizAnswer', { quizData: response })
          }
        ]
      );

    } catch (err) {
      console.error('❌ Quiz generation error:', err);
      let errorMessage = 'Failed to generate quiz. Please try again.';

      if (err.message) {
        if (err.message.includes('0 out of')) {
          errorMessage = 'Unable to generate questions from this audio. Try:\n\n• Using clearer audio with speech content\n• Selecting a lower difficulty\n• Using a different audio file\n• Reducing the number of questions';
        } else if (err.message.includes('network') || err.message.includes('timeout')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (err.message.includes('authentication') || err.message.includes('token')) {
          errorMessage = 'Authentication expired. Please login again.';
        } else {
          errorMessage = err.message;
        }
      }

      Alert.alert('Generation Failed', errorMessage, [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
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
      <ScrollView
        className="px-6 py-8"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          style={{ borderRadius: 16, padding: 20, marginBottom: 24 }}
          colors={['#3B82F6', '#6366F1']}
        >
          <Text className="text-2xl font-bold text-white text-center">
            Generate Quiz from Audio
          </Text>
          <Text className="text-blue-100 text-center mt-2 text-sm">
            Upload an audio file and we'll create questions for you
          </Text>
        </LinearGradient>

        {/* File Upload Section */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Audio File
          </Text>
          <TouchableOpacity
            onPress={pickAudio}
            className="bg-blue-500 py-4 px-6 rounded-xl mb-4 shadow-sm"
            activeOpacity={0.8}
          >
            <Text className="text-white text-center font-semibold text-base">
              {file ? 'Change Audio File' : 'Select Audio File'}
            </Text>
          </TouchableOpacity>

          {file && (
            <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <Text className="font-semibold text-gray-800 mb-2">Selected File:</Text>
              <Text className="text-gray-700 mb-1">📄 {file.name}</Text>
              <Text className="text-gray-600 mb-1">📁 {file.type}</Text>
              <Text className="text-gray-600">📏 {formatFileSize(file.size)}</Text>
            </View>
          )}
        </View>

        {/* Question Type */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Question Type
          </Text>
          <View className="border border-gray-300 rounded-xl bg-white shadow-sm overflow-hidden">
            <Picker
              selectedValue={questionType}
              onValueChange={setQuestionType}
              style={{ height: 50, color: '#374151' }}
            >
              <Picker.Item label="Select Question Type" value="default" />
              <Picker.Item label="Multiple Choice Questions" value="mcq" />
              <Picker.Item label="True / False Questions" value="true_false" />
              <Picker.Item label="Mixed Questions" value="both" />
            </Picker>
          </View>
        </View>

        {/* Number of Questions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Number of Questions
          </Text>
          <View className="border border-gray-300 rounded-xl bg-white shadow-sm overflow-hidden">
            <Picker
              selectedValue={numberOfQuestions}
              onValueChange={setNumberOfQuestions}
              style={{ height: 50, color: '#374151' }}
            >
              <Picker.Item label="Select number of questions" value="" />
              <Picker.Item label="5 Questions" value="5" />
              <Picker.Item label="10 Questions" value="10" />
              <Picker.Item label="15 Questions" value="15" />
              <Picker.Item label="20 Questions" value="20" />
            </Picker>
          </View>
        </View>

        {/* Difficulty */}
        <View className="mb-8">
          <Text className="text-lg font-semibold text-gray-800 mb-3">
            Difficulty Level
          </Text>
          <View className="border border-gray-300 rounded-xl bg-white shadow-sm overflow-hidden">
            <Picker
              selectedValue={difficulty}
              onValueChange={setDifficulty}
              style={{ height: 50, color: '#374151' }}
            >
              <Picker.Item label="Select Difficulty" value="" />
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
              Generating your quiz...{'\n'}This may take a few moments
            </Text>
          </View>
        ) : (
          <LinearGradient
            colors={['#3B82F6', '#6366F1']}
            style={{ borderRadius: 16, padding: 2 }}
          >
            <TouchableOpacity
              onPress={handleGenerate}
              className="bg-transparent py-4 px-6 rounded-xl items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-lg">
                Generate Quiz Questions
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        )}

        {/* Tips Section */}
        <View className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
          <Text className="font-semibold text-blue-800 mb-2">💡 Tips for better results:</Text>
          <Text className="text-blue-700 text-sm leading-5">
            • Use clear audio with speech content{'\n'}
            • Avoid background noise or music{'\n'}
            • Shorter files (under 10 minutes) work better{'\n'}
            • Try lower difficulty if generation fails
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default GenerateFromAudio;
