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
import { pick, types } from '@react-native-documents/picker';
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
    (async () => {
      try {
        const user = JSON.parse(await AsyncStorage.getItem('user') || 'null');
        if (user?.userId && user?.token) {
          setUserId(user.userId);
          setToken(user.token);
        }
      } catch (err) {
        
      }
    })();
  }, []);

  const requestAudioPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO || PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Audio Permission',
          message: 'App needs access to your audio files.',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const pickAudio = async () => {
    
    const granted = await requestAudioPermission();
    if (!granted) {
      Alert.alert('Permission denied', 'Audio permission required.');
      return;
    }

    try {
      const [pickedFile] = await pick({
        type: [types.audio],
      });
     
      setFile(pickedFile);
    } catch (err) {
      if (err.code === 'DOCUMENT_PICKER_CANCELED') {
      
      } else {
        
        Alert.alert('Oops!', 'Could not open audio picker.');
      }
    }
  };

  const handleGenerate = async () => {
    if (!file) return Alert.alert('Upload an audio file.');
    if (questionType === 'default') return Alert.alert('Select a question type.');
    if (!numberOfQuestions) return Alert.alert('Select number of questions.');
    if (!difficulty) return Alert.alert('Select difficulty.');
    if (!userId || !token) return Alert.alert('User not logged in.');

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append('Audio', {
        uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
        type: file.type || 'audio/mpeg',
        name: file.name || 'audio.mp3',
      });
      
      formData.append('question_type', questionType);
      formData.append('number_question', numberOfQuestions);
      formData.append('difficulty', difficulty);
      formData.append('token', token);
      

      const res = await generateQuiz(userId, formData, true);

      Alert.alert('Quiz Generated!', 'Quiz has been successfully created.');
      navigation.navigate('QuizAnswer', { quizData: res });
    } catch (err) {
      
      Alert.alert('Oops!', err.message || 'Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >

 <LinearGradient style={{ width: '100%', padding: 16, marginBottom: 24 }} colors={['#2563eb', '#4f46e5']}>
          <Text className="text-2xl font-extrabold text-white text-center">
            Generate Quiz from Audio
          </Text>
        </LinearGradient>

      <ScrollView className="px-6 py-8" contentContainerStyle={{ paddingBottom: 40 }}>
       

        <TouchableOpacity onPress={pickAudio} className="bg-blue-500 py-3 px-4 rounded-xl mb-4">
          <Text className="text-white text-center font-semibold">Upload Audio File</Text>
        </TouchableOpacity>

        {file && (
          <View className="bg-gray-100 rounded-xl p-4 mb-4">
            <Text className="font-bold mb-1">Selected Audio:</Text>
            <Text>Name: {file.name}</Text>
            <Text>Type: {file.type}</Text>
            <Text>Size: {file.size} bytes</Text>
          </View>
        )}

        {/* Question Type */}
        <Text className="font-medium text-gray-700 mb-2">Question Type</Text>
        <View className="border border-gray-300 rounded-xl bg-white shadow-sm mb-4 overflow-hidden">
          <Picker selectedValue={questionType} onValueChange={setQuestionType} style={{ height: 50 , color: '#1f2937'}}>
            <Picker.Item label="Select Question Type" value="default" />
            <Picker.Item label="Multiple Choice" value="mcq" />
            <Picker.Item label="True / False" value="true_false" />
            <Picker.Item label="Both" value="both" />
          </Picker>
        </View>

        {/* Number of Questions */}
        <Text className="font-medium text-gray-700 mb-2">Number of Questions</Text>
        <View className="border border-gray-300 rounded-xl bg-white shadow-sm mb-4 overflow-hidden">
          <Picker selectedValue={numberOfQuestions} onValueChange={setNumberOfQuestions} style={{ height: 50 , color: '#1f2937'}}>
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
          <Picker selectedValue={difficulty} onValueChange={setDifficulty} style={{ height: 50 , color: '#1f2937'}}>
            <Picker.Item label="Select Difficulty" value="" />
            <Picker.Item label="Easy" value="easy" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="Hard" value="hard" />
          </Picker>
        </View>

        {loading ? (
          <View className="py-4 items-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-gray-500 mt-2">Generating quiz…</Text>
          </View>
        ) : (
          <LinearGradient colors={['#2563eb', '#4f46e5']} style={{ borderRadius: 12, padding: 16 }}>
            <TouchableOpacity onPress={handleGenerate} className="items-center">
              <Text className="text-white font-bold text-lg">Generate Questions</Text>
            </TouchableOpacity>
          </LinearGradient>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default GenerateFromAudio;
