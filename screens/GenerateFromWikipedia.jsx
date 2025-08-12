import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
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
import { generateQuiz } from '../services/apiClient';

const GenerateFromWikipedia = () => {
  const navigation = useNavigation();

  const [url, setUrl] = useState('');
  const [questionType, setQuestionType] = useState('default');
  const [numberOfQuestions, setNumberOfQuestions] = useState('');
  const [difficulty, setDifficulty] = useState('default');
  const [errors, setErrors] = useState({});
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
        console.error('AsyncStorage error:', err);
      }
    })();
  }, []);

  const validate = () => {
    const errs = {};
    if (!url.trim()) {
      errs.url = 'Wikipedia URL is required';
    } else if (!/^https:\/\/(.*\.)?wikipedia\.org\/wiki\//.test(url.trim())) {
      errs.url = 'Enter a valid Wikipedia URL';
    }
    if (questionType === 'default') errs.questionType = 'Select a question type';
    if (!numberOfQuestions) errs.numberOfQuestions = 'Select number of questions';
    if (difficulty === 'default') errs.difficulty = 'Select difficulty';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGenerate = async () => {
    if (!validate()) return;

    if (!userId || !token) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        url: url.trim(),
        question_type: questionType,
        number_question: numberOfQuestions,
        difficulty,
        token,
      };

      const response = await generateQuiz(userId, payload);
      Alert.alert('Success', 'Quiz generated successfully');
      navigation.navigate('QuizAnswer', { quizData: response });
    } catch (err) {
      console.error('Generate Quiz Error:', err);
      Alert.alert('Error', err.message || 'Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: 'white' }}
    >
      <LinearGradient
          colors={['#2563eb', '#4f46e5']}
          style={{ width:'100%', padding: 20, marginBottom: 24 }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 24,
              fontWeight: '700',
              textAlign: 'center',
            }}
          >
            Generate Quiz from Wikipedia
          </Text>
        </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
      
        {/* Wikipedia URL Input */}
        <Text style={{ fontWeight: '600', marginBottom: 6, color: '#374151' }}>
          Wikipedia URL
        </Text>
        <TextInput
          value={url}
          onChangeText={(text) => {
            setUrl(text);
            setErrors((prev) => ({ ...prev, url: undefined }));
          }}
          placeholder="https://en.wikipedia.org/wiki/Example"
          placeholderTextColor="#9ca3af"
          style={{
            borderWidth: 1,
            borderColor: errors.url ? 'red' : '#d1d5db',
            borderRadius: 10,
            padding: 12,
            marginBottom: errors.url ? 4 : 16,
            color: '#111827',
            backgroundColor: 'white',
          }}
          keyboardType="url"
          autoCapitalize="none"
        />
        {errors.url && (
          <Text style={{ color: 'red', marginBottom: 12 }}>{errors.url}</Text>
        )}

        {/* Question Type Picker */}
        <Text style={{ fontWeight: '600', marginBottom: 6, color: '#374151' }}>
          Question Type
        </Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: errors.questionType ? 'red' : '#d1d5db',
            borderRadius: 10,
            marginBottom: errors.questionType ? 4 : 16,
            overflow: 'hidden',
            backgroundColor: 'white',
          }}
        >
          <Picker
            selectedValue={questionType}
            onValueChange={(itemValue) => {
              setQuestionType(itemValue);
              setErrors((prev) => ({ ...prev, questionType: undefined }));
            }}
            style={{ height: 50, color: '#1f2937' }}
          >
            <Picker.Item label="Select Question Type" value="default" />
            <Picker.Item label="Multiple Choice" value="mcq" />
            <Picker.Item label="True / False" value="true_false" />
            <Picker.Item label="Both" value="both" />
          </Picker>
        </View>
        {errors.questionType && (
          <Text style={{ color: 'red', marginBottom: 12 }}>{errors.questionType}</Text>
        )}

        {/* Number of Questions Picker */}
        <Text style={{ fontWeight: '600', marginBottom: 6, color: '#374151' }}>
          Number of Questions
        </Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: errors.numberOfQuestions ? 'red' : '#d1d5db',
            borderRadius: 10,
            marginBottom: errors.numberOfQuestions ? 4 : 16,
            overflow: 'hidden',
            backgroundColor: 'white',
          }}
        >
          <Picker
            selectedValue={numberOfQuestions}
            onValueChange={(itemValue) => {
              setNumberOfQuestions(itemValue);
              setErrors((prev) => ({ ...prev, numberOfQuestions: undefined }));
            }}
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
        {errors.numberOfQuestions && (
          <Text style={{ color: 'red', marginBottom: 12 }}>{errors.numberOfQuestions}</Text>
        )}

        {/* Difficulty Picker */}
        <Text style={{ fontWeight: '600', marginBottom: 6, color: '#374151' }}>
          Difficulty
        </Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: errors.difficulty ? 'red' : '#d1d5db',
            borderRadius: 10,
            marginBottom: errors.difficulty ? 4 : 24,
            overflow: 'hidden',
            backgroundColor: 'white',
          }}
        >
          <Picker
            selectedValue={difficulty}
            onValueChange={(itemValue) => {
              setDifficulty(itemValue);
              setErrors((prev) => ({ ...prev, difficulty: undefined }));
            }}
            style={{ height: 50, color: '#1f2937' }}
          >
            <Picker.Item label="Select Difficulty" value="default" />
            <Picker.Item label="Easy" value="easy" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="Hard" value="hard" />
          </Picker>
        </View>
        {errors.difficulty && (
          <Text style={{ color: 'red', marginBottom: 12 }}>{errors.difficulty}</Text>
        )}

        {/* Generate Button or Loading */}
        {loading ? (
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={{ marginTop: 12, color: '#6b7280' }}>Generating quiz…</Text>
          </View>
        ) : (
          <LinearGradient
            colors={['#2563eb', '#4f46e5']}
            style={{ borderRadius: 12, paddingVertical: 16 }}
          >
            <TouchableOpacity onPress={handleGenerate} style={{ alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 18 }}>
                Generate Quiz
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default GenerateFromWikipedia;
