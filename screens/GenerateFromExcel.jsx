

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

const GenerateFromExcel = () => {
  const navigation = useNavigation();

  const [file, setFile] = useState(null);
  const [questionType, setQuestionType] = useState('default');
  const [numberOfQuestions, setNumberOfQuestions] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileContentWarning, setFileContentWarning] = useState(false);

  // Load user data
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

  // Validate Excel file content (basic check)
  const validateFileContent = (fileName) => {
    // Check if file has minimum content requirements
    const isFinancialFile = fileName.toLowerCase().includes('financial');
    const isTechnicalFile = fileName.toLowerCase().match(/(tech|science|math|engineering)/);
    
    if (!isFinancialFile && !isTechnicalFile) {
      setFileContentWarning(true);
      return false;
    }
    return true;
  };

  // Pick Excel document
  const pickDocument = async () => {
    try {
      const [selected] = await pick({
        type: [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
        allowMultiSelection: false,
      });

      if (selected) {
        setFile(selected);
        setFileContentWarning(false);
        validateFileContent(selected.name);
      }
    } catch (err) {
      if (err.code !== 'DOCUMENT_PICKER_CANCELED') {
        Alert.alert('Error', 'Please select a valid Excel file (.xls or .xlsx)');
      }
    }
  };

  const handleGenerate = async () => {
    // Validation
    if (!file) {
      Alert.alert('Error', 'Please upload an Excel document first');
      return;
    }
    if (questionType === 'default') {
      Alert.alert('Error', 'Please select a question type');
      return;
    }
    if (!numberOfQuestions) {
      Alert.alert('Error', 'Please select number of questions');
      return;
    }
    if (!difficulty) {
      Alert.alert('Error', 'Please select difficulty level');
      return;
    }
    if (fileContentWarning) {
      Alert.alert(
        'Content Warning', 
        'Your file may not contain enough text content for question generation. ' +
        'Try files with more textual content (e.g., financial reports, technical documents).'
      );
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      let fileUri = file.uri;
      
      // Fix for iOS file URI
      if (Platform.OS === 'ios' && fileUri.startsWith('file://')) {
        fileUri = fileUri.replace('file://', '');
      }

      formData.append('Document', {
        uri: fileUri,
        type: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        name: file.name || 'document.xlsx',
      });
      formData.append('question_type', questionType);
      formData.append('number_question', numberOfQuestions);
      formData.append('difficulty', difficulty);
      formData.append('token', token);

      console.log('Sending request with:', {
        questionType,
        numberOfQuestions,
        difficulty,
        file: { name: file.name, size: file.size }
      });

      const res = await generateQuiz(userId, formData, true);

      if (res.error) {
        if (res.error.includes('Only 0 out of')) {
          Alert.alert(
            'No Questions Generated',
            'The system couldn\'t generate questions from this file. Possible reasons:\n\n' +
            '1. File doesn\'t contain enough text content\n' +
            '2. Content is too complex/simple for selected difficulty\n' +
            '3. File format issues\n\n' +
            'Try a different file or adjust settings.'
          );
        } else if (res.error.match(/Only \d+ out of \d+ questions were generated/)) {
          const generatedCount = parseInt(res.error.match(/Only (\d+) out of/)[1]);
          if (generatedCount > 0) {
            navigation.navigate('QuizAnswer', { quizData: res });
          }
          Alert.alert(
            'Partial Success',
            `${res.error}\n\nYou can proceed with the generated questions or try again with different settings.`
          );
        } else {
          Alert.alert('Error', res.error);
        }
      } else {
        navigation.navigate('QuizAnswer', { quizData: res });
      }
    } catch (err) {
      console.error('API Error:', err);
      Alert.alert(
        'Error',
        err.message || 'Failed to process the file. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: 'white' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient 
        colors={['#2563eb', '#4f46e5']}
        style={{ width: '100%', padding: 16, marginBottom: 24 }}
      >
        <Text style={{ fontSize: 24, fontWeight: '800', color: 'white', textAlign: 'center' }}>
          Generate Quiz from Excel
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        {/* File Upload */}
        <TouchableOpacity
          onPress={pickDocument}
          style={{
            backgroundColor: '#2563eb',
            paddingVertical: 12,
            borderRadius: 16,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600', fontSize: 16 }}>
            {file ? 'Change Excel File' : 'Upload Excel File'}
          </Text>
        </TouchableOpacity>

        {/* Selected File Info */}
        {file && (
          <View style={{ 
            backgroundColor: '#f3f4f6', 
            borderRadius: 16, 
            padding: 16, 
            marginBottom: 20 
          }}>
            <Text style={{ fontWeight: '700', marginBottom: 6 }}>Selected File:</Text>
            <Text>Name: {file.name}</Text>
            <Text>Type: {file.type}</Text>
            <Text>Size: {Math.round(file.size / 1024)} KB</Text>
            
            {fileContentWarning && (
              <Text style={{ color: 'orange', marginTop: 8 }}>
                ⚠️ This file may not have enough text content for questions
              </Text>
            )}
          </View>
        )}

        {/* Question Type Picker */}
        <Text style={{ fontWeight: '600', marginBottom: 8, color: '#374151' }}>
          Question Type
        </Text>
        <View style={{
          borderWidth: 1,
          borderColor: '#d1d5db',
          borderRadius: 16,
          marginBottom: 20,
          backgroundColor: 'white',
        }}>
          <Picker
            selectedValue={questionType}
            onValueChange={setQuestionType}
            style={{ height: 50, color: '#1f2937' }}
          >
            <Picker.Item label="Select Question Type" value="default" />
            <Picker.Item label="Multiple Choice" value="mcq" />
            <Picker.Item label="True/False" value="true_false" />
            <Picker.Item label="Both Types" value="both" />
          </Picker>
        </View>

        {/* Number of Questions Picker */}
        <Text style={{ fontWeight: '600', marginBottom: 8, color: '#374151' }}>
          Number of Questions
        </Text>
        <View style={{
          borderWidth: 1,
          borderColor: '#d1d5db',
          borderRadius: 16,
          marginBottom: 20,
          backgroundColor: 'white',
        }}>
          <Picker
            selectedValue={numberOfQuestions}
            onValueChange={setNumberOfQuestions}
            style={{ height: 50, color: '#1f2937' }}
          >
            <Picker.Item label="Select quantity" value="" />
            <Picker.Item label="5" value="5" />
            <Picker.Item label="10" value="10" />
            <Picker.Item label="15" value="15" />
            <Picker.Item label="20" value="20" />
            <Picker.Item label="25" value="25" />
          </Picker>
        </View>

        {/* Difficulty Picker */}
        <Text style={{ fontWeight: '600', marginBottom: 8, color: '#374151' }}>
          Difficulty Level
        </Text>
        <View style={{
          borderWidth: 1,
          borderColor: '#d1d5db',
          borderRadius: 16,
          marginBottom: 32,
          backgroundColor: 'white',
        }}>
          <Picker
            selectedValue={difficulty}
            onValueChange={setDifficulty}
            style={{ height: 50, color: '#1f2937' }}
          >
            <Picker.Item label="Select difficulty" value="" />
            <Picker.Item label="Easy" value="easy" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="Hard" value="hard" />
          </Picker>
        </View>

        {/* Generate Button */}
        {loading ? (
          <View style={{ paddingVertical: 16, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={{ marginTop: 8, color: '#6b7280' }}>
              Processing your file...
            </Text>
          </View>
        ) : (
          <LinearGradient
            colors={['#2563eb', '#4f46e5']}
            style={{ borderRadius: 16, padding: 16 }}
          >
            <TouchableOpacity 
              onPress={handleGenerate} 
              disabled={!file}
              style={{ alignItems: 'center' }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 18 }}>
                Generate Quiz
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        )}

        {/* Help Text */}
        <Text style={{ 
          marginTop: 24,
          color: '#6b7280',
          fontSize: 12,
          textAlign: 'center'
        }}>
          Tip: For best results, use Excel files with plenty of text content.
          Financial reports, technical documents, and educational materials work well.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default GenerateFromExcel;