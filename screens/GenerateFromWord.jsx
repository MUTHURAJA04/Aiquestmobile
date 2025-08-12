import React, { useState, useEffect } from 'react';
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
  const [questionType, setQuestionType] = useState('default');
  const [numberOfQuestions, setNumberOfQuestions] = useState('default');
  const [difficulty, setDifficulty] = useState('default');
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load userId and token on mount
  useEffect(() => {
    (async () => {
      try {
        const user = JSON.parse(await AsyncStorage.getItem('user') || 'null');
        if (user?.userId && user?.token) {
          setUserId(user.userId);
          setToken(user.token);
        }
      } catch (err) {
        console.error('AsyncStorage error:', err);
      }
    })();
  }, []);

  // Pick Word document file
  const pickDocument = async () => {
    try {
      const [selected] = await pick({
        type: [
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        allowMultiSelection: false,
      });
      if (selected) {
        setFile(selected);
      }
    } catch (err) {
      if (err.code !== 'DOCUMENT_PICKER_CANCELED') {
        Alert.alert('Error', err.message || 'Unable to pick document');
      }
    }
  };

  // Validate all inputs before API call
  const validate = () => {
    if (!file) {
      Alert.alert('Validation Error', 'Please upload a Word document.');
      return false;
    }
    if (questionType === 'default') {
      Alert.alert('Validation Error', 'Please select a question type.');
      return false;
    }
    if (numberOfQuestions === 'default') {
      Alert.alert('Validation Error', 'Please select number of questions.');
      return false;
    }
    if (difficulty === 'default') {
      Alert.alert('Validation Error', 'Please select difficulty.');
      return false;
    }
    if (!userId || !token) {
      Alert.alert('Error', 'User not logged in.');
      return false;
    }
    return true;
  };

  // Handle generate quiz button press
  const handleGenerate = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      let fileUri = file.uri;
      if (Platform.OS === 'ios' && fileUri.startsWith('file://')) {
        fileUri = fileUri.replace('file://', '');
      }

      formData.append('Document', {
        uri: fileUri,
        type: file.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        name: file.name || 'document.docx',
      });
      formData.append('question_type', questionType);
      formData.append('number_question', numberOfQuestions);
      formData.append('difficulty', difficulty);
      formData.append('token', token);

      const res = await generateQuiz(userId, formData, true);

      if (res.error) {
        if (res.error.includes('Only 0 out of')) {
          Alert.alert(
            'No Questions Generated',
            'No questions could be generated. Try different content or lower difficulty.'
          );
        } else if (res.error.match(/Only \d+ out of \d+ questions were generated/)) {
          if (res.questions && res.questions.length > 0) {
            navigation.navigate('QuizAnswer', { quizData: res });
          }
          Alert.alert(
            'Partial Questions Generated',
            `${res.error} You may want to try lowering difficulty or number of questions.`
          );
        } else {
          Alert.alert('Warning', res.error);
        }
      } else {
        navigation.navigate('QuizAnswer', { quizData: res });
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to generate quiz.');
      console.error('Generate Quiz Error:', err);
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
          Generate Quiz from Word Document
        </Text>
      </LinearGradient>

      <ScrollView className="px-6" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* File Upload Button */}
        <TouchableOpacity
          onPress={pickDocument}
          className="bg-blue-600 py-3 rounded-xl mb-4"
        >
          <Text className="text-white text-center font-semibold text-base">
            Upload Word Document File
          </Text>
        </TouchableOpacity>

        {/* Selected File Info */}
        {file && (
          <View className="bg-gray-100 rounded-xl p-4 mb-5">
            <Text className="font-bold mb-1">Selected File:</Text>
            <Text>Name: {file.name}</Text>
            <Text>Type: {file.type}</Text>
            <Text>Size: {file.size} bytes</Text>
          </View>
        )}

        {/* Question Type Picker */}
        <Text className="font-medium text-gray-700 mb-2">Question Type</Text>
        <View className="border border-gray-300 rounded-xl mb-5 bg-white">
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

        {/* Number of Questions Picker */}
        <Text className="font-medium text-gray-700 mb-2">Number of Questions</Text>
        <View className="border border-gray-300 rounded-xl mb-5 bg-white">
          <Picker
            selectedValue={numberOfQuestions}
            onValueChange={setNumberOfQuestions}
            style={{ height: 50, color: '#1f2937' }}
          >
            <Picker.Item label="Select number of questions" value="default" />
            <Picker.Item label="5" value="5" />
            <Picker.Item label="10" value="10" />
            <Picker.Item label="15" value="15" />
            <Picker.Item label="20" value="20" />
            <Picker.Item label="25" value="25" />
          </Picker>
        </View>

        {/* Difficulty Picker */}
        <Text className="font-medium text-gray-700 mb-2">Difficulty</Text>
        <View className="border border-gray-300 rounded-xl mb-8 bg-white">
          <Picker
            selectedValue={difficulty}
            onValueChange={setDifficulty}
            style={{ height: 50, color: '#1f2937' }}
          >
            <Picker.Item label="Select Difficulty" value="default" />
            <Picker.Item label="Easy" value="easy" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="Hard" value="hard" />
          </Picker>
        </View>

        {/* Generate Button */}
        {loading ? (
          <View className="py-4 items-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-gray-500 mt-2">Generating quiz…</Text>
          </View>
        ) : (
          <LinearGradient
            colors={['#2563eb', '#4f46e5']}
            className="rounded-xl p-4"
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

export default GenerateFromWord;