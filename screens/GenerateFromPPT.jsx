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
import { generateQuiz } from '../services/apiClient'; // your apiClient import

const GenerateFromPPT = () => {
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
          console.log(' User data loaded:', user);
        } else {
          console.warn('⚠️ No user found in AsyncStorage');
        }
      } catch (err) {
        console.error('AsyncStorage error:', err);
      }
    })();
  }, []);

  const pickDocument = async () => {
    try {
      const [selected] = await pick({
        type: [
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ],
        allowMultiSelection: false,
      });

      if (selected) {
        setFile(selected);
        console.log(' Selected PPT file:', selected);
      }
    } catch (err) {
      console.log(' Document pick error:', err);
      Alert.alert('Error', err.message || 'Unable to pick document');
    }
  };

  const handleGenerate = async () => {
    if (!file) return Alert.alert('Please upload a PPT document.');
    if (questionType === 'default') return Alert.alert('Select a question type.');
    if (!numberOfQuestions) return Alert.alert('Select number of questions.');
    if (!difficulty) return Alert.alert('Select difficulty.');
    if (!userId || !token) return Alert.alert('User not logged in.');

    setLoading(true);

    try {
      const formData = new FormData();

      formData.append('Document', {
        uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
        type: file.type,
        name: file.name || 'presentation.pptx',
      });

      formData.append('question_type', questionType);
      formData.append('number_question', String(numberOfQuestions));
      formData.append('difficulty', difficulty);
      formData.append('token', token);

      console.log('Sending quiz generation request with:', {
        question_type: questionType,
        number_question: numberOfQuestions,
        difficulty,
        token,
        file,
      });

      const res = await generateQuiz(userId, formData, true);

      console.log(' Quiz generated response:', res);

      Alert.alert('Quiz Generated!', 'Quiz has been successfully created.');
      navigation.navigate('QuizAnswer', { quizData: res });
    } catch (err) {
      console.error('❌ Generate Quiz Error:', err);
      Alert.alert('Error', err.message || 'Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: 'white' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient style={{ width: '100%', padding: 16, marginBottom: 24 }} colors={['#2563eb', '#4f46e5']}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: 'white', textAlign: 'center' }}>
          Generate Quiz from PPT File
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        <TouchableOpacity
          onPress={pickDocument}
          style={{ backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 16, marginBottom: 16 }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600', fontSize: 16 }}>
            Upload PPT File
          </Text>
        </TouchableOpacity>

        {file && (
          <View style={{ backgroundColor: '#f3f4f6', borderRadius: 16, padding: 16, marginBottom: 20 }}>
            <Text style={{ fontWeight: '700', marginBottom: 6 }}>Selected File:</Text>
            <Text>Name: {file.name}</Text>
            <Text>Type: {file.type}</Text>
            <Text>Size: {file.size} bytes</Text>
          </View>
        )}

        {/* Question Type */}
        <Text style={{ fontWeight: '600', marginBottom: 8, color: '#374151' }}>Question Type</Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: '#d1d5db',
            borderRadius: 16,
            marginBottom: 20,
            backgroundColor: 'white',
          }}
        >
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

        {/* Number of Questions */}
        <Text style={{ fontWeight: '600', marginBottom: 8, color: '#374151' }}>Number of Questions</Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: '#d1d5db',
            borderRadius: 16,
            marginBottom: 20,
            backgroundColor: 'white',
          }}
        >
          <Picker
            selectedValue={numberOfQuestions}
            onValueChange={setNumberOfQuestions}
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

        {/* Difficulty */}
        <Text style={{ fontWeight: '600', marginBottom: 8, color: '#374151' }}>Difficulty</Text>
        <View
          style={{
            borderWidth: 1,
            borderColor: '#d1d5db',
            borderRadius: 16,
            marginBottom: 32,
            backgroundColor: 'white',
          }}
        >
          <Picker
            selectedValue={difficulty}
            onValueChange={setDifficulty}
            style={{ height: 50, color: '#1f2937' }}
          >
            <Picker.Item label="Select Difficulty" value="" />
            <Picker.Item label="Easy" value="easy" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="Hard" value="hard" />
          </Picker>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 16, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={{ marginTop: 8, color: '#6b7280' }}>Generating quiz…</Text>
          </View>
        ) : (
          <LinearGradient colors={['#2563eb', '#4f46e5']} style={{ borderRadius: 16, padding: 16 }}>
            <TouchableOpacity onPress={handleGenerate} style={{ alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 18 }}>Generate Questions</Text>
            </TouchableOpacity>
          </LinearGradient>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default GenerateFromPPT;
