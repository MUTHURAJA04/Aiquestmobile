

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
import { launchImageLibrary } from 'react-native-image-picker';
import { generateQuiz } from '../services/apiClient';

const GenerateFromVideo = () => {
  const navigation = useNavigation();
  const [file, setFile] = useState(null);
  const [questionType, setQuestionType] = useState('mcq'); // Default to MCQ
  const [numberOfQuestions, setNumberOfQuestions] = useState('5'); // Default to 5
  const [difficulty, setDifficulty] = useState('medium'); // Default to medium
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState('');

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

  const pickVideo = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'video',
        selectionLimit: 1,
        videoQuality: 'medium',
      });

      if (result.didCancel) return;
      if (result.errorCode) {
        throw new Error(result.errorMessage || 'Failed to pick video');
      }

      const asset = result.assets[0];
      setFile(asset);
      setVideoInfo(`Selected: ${asset.fileName || 'video'} (${Math.round(asset.fileSize / 1024)} KB)`);
      console.log(' Picked video:', asset);
    } catch (error) {
      console.error('Video picker error:', error);
      Alert.alert('Error', error.message || 'Failed to select video');
    }
  };

  const validateInputs = () => {
    if (!file) {
      Alert.alert('Error', 'Please upload a video file.');
      return false;
    }
    
    // Validate video duration (example: minimum 30 seconds)
    if (file.duration < 30) {
      Alert.alert('Error', 'Video should be at least 30 seconds long for better results.');
      return false;
    }
    
    return true;
  };

  const handleGenerate = async () => {
    if (!validateInputs()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      
      // Prepare video file
      formData.append('Video', {
        uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
        type: file.type || 'video/mp4',
        name: file.fileName || `video_${Date.now()}.mp4`,
      });

      // Add other fields
      formData.append('question_type', questionType);
      formData.append('number_question', numberOfQuestions);
      formData.append('difficulty', difficulty);
      formData.append('token', token);

      // Add video metadata for better processing
      formData.append('video_duration', file.duration || 0);
      formData.append('video_size', file.fileSize || 0);

      console.log('Submitting form data:', {
        questionType,
        numberOfQuestions,
        difficulty,
        videoSize: file.fileSize,
        videoDuration: file.duration,
      });

      const res = await generateQuiz(userId, formData, true);

      navigation.navigate('QuizAnswer', { 
        quizData: res,
        videoInfo: videoInfo || 'Generated from video',
      });
    } catch (error) {
      console.error('Quiz generation error:', error);
      
      let errorMessage = error.message;
      if (errorMessage.includes('Only 0 out of')) {
        errorMessage = 'The video content is not suitable for generating questions. Try a different video with clearer speech or more content.';
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
      <ScrollView 
        className="px-6 py-8" 
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient 
          style={{ borderRadius: 12, padding: 16, marginBottom: 24 }} 
          colors={['#2563eb', '#4f46e5']}
        >
          <Text className="text-2xl font-extrabold text-white text-center">
            Generate Quiz from Video
          </Text>
        </LinearGradient>

        <TouchableOpacity 
          onPress={pickVideo} 
          className="bg-blue-500 py-3 px-4 rounded-xl mb-4"
          disabled={loading}
        >
          <Text className="text-white text-center font-semibold">
            {file ? 'Change Video' : 'Upload Video File'}
          </Text>
        </TouchableOpacity>

        {file && (
          <View className="bg-gray-100 rounded-xl p-4 mb-4">
            <Text className="font-bold mb-1">Selected Video:</Text>
            <Text className="text-gray-700">{videoInfo}</Text>
            <Text className="text-gray-700">
              Duration: {file.duration ? `${Math.round(file.duration)}s` : 'N/A'}
            </Text>
          </View>
        )}

        <Text className="font-medium text-gray-700 mb-2">Question Type</Text>
        <View className="border border-gray-300 rounded-xl bg-white shadow-sm mb-4 overflow-hidden">
          <Picker 
            selectedValue={questionType} 
            onValueChange={setQuestionType} 
            style={{ height: 50, color: '#1f2937' }}
            enabled={!loading}
          >
            <Picker.Item label="Multiple Choice" value="mcq" />
            <Picker.Item label="True / False" value="true_false" />
            <Picker.Item label="Both Types" value="both" />
          </Picker>
        </View>

        <Text className="font-medium text-gray-700 mb-2">Number of Questions</Text>
        <View className="border border-gray-300 rounded-xl bg-white shadow-sm mb-4 overflow-hidden">
          <Picker 
            selectedValue={numberOfQuestions} 
            onValueChange={setNumberOfQuestions} 
            style={{ height: 50, color: '#1f2937' }}
            enabled={!loading}
          >
            <Picker.Item label="5" value="5" />
            <Picker.Item label="10" value="10" />
            <Picker.Item label="15" value="15" />
            <Picker.Item label="20" value="20" />
          </Picker>
        </View>

        <Text className="font-medium text-gray-700 mb-2">Difficulty</Text>
        <View className="border border-gray-300 rounded-xl bg-white shadow-sm mb-6 overflow-hidden">
          <Picker 
            selectedValue={difficulty} 
            onValueChange={setDifficulty} 
            style={{ height: 50, color: '#1f2937' }}
            enabled={!loading}
          >
            <Picker.Item label="Easy" value="easy" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="Hard" value="hard" />
          </Picker>
        </View>

        {loading ? (
          <View className="py-4 items-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-gray-500 mt-2">Analyzing video and generating questions...</Text>
          </View>
        ) : (
          <LinearGradient 
            colors={['#2563eb', '#4f46e5']} 
            style={{ borderRadius: 12, padding: 16 }}
          >
            <TouchableOpacity 
              onPress={handleGenerate} 
              className="items-center"
              disabled={!file || loading}
            >
              <Text className="text-white font-bold text-lg">
                Generate Quiz
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default GenerateFromVideo;