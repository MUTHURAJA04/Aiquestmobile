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

  // ✅ FIXED: Proper file validation
  const validateFile = () => {
    if (!file) {
      Alert.alert('Error', 'Please upload an Excel document.');
      return false;
    }
    
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    
    if (file.size < 1024) { // 1KB minimum for Excel
      Alert.alert('Error', 'The Excel file must be at least 1KB in size.');
      return false;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB max for Excel
      Alert.alert(
        'File Too Large',
        `Your Excel file is ${fileSizeMB}MB. Please select a file under 5MB.`
      );
      return false;
    }
    
    return true;
  };

  // ✅ FIXED: Pick Excel document
  const pickDocument = async () => {
    try {
      const result = await pick({
        type: [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
        allowMultiSelection: false,
      });

      if (result && result.length > 0) {
        const selected = result[0];
        setFile(selected);
        console.log('Selected Excel file:', selected);
      }
    } catch (err) {
      if (err.code !== 'DOCUMENT_PICKER_CANCELED') {
        console.error('Document picker error:', err);
        Alert.alert('Error', 'Failed to select Excel file. Please try again.');
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
  if (!validateFile()) {
    return;
  }

  setLoading(true);

  try {
    const formData = new FormData();
    formData.append('excel', {
      uri: file.uri,
      type: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      name: file.name || 'spreadsheet.xlsx',
    });
    formData.append('question_type', questionType);
    formData.append('number_question', numberOfQuestions);
    formData.append('difficulty', difficulty);
    formData.append('token', token);
    formData.append('language', 'en');

    console.log('📤 Sending Excel request:', {
      questionType,
      numberOfQuestions,
      difficulty,
      file: { name: file.name, size: file.size }
    });

    const res = await generateQuiz(userId, formData, true);

    console.log('📥 Excel API Response:', res);

    // ✅ Handle partial question generation
    if (res.questions && res.questions.length > 0) {
      if (res.questions.length < parseInt(numberOfQuestions)) {
        Alert.alert(
          'Partial Quiz Generated',
          `Only ${res.questions.length} out of ${numberOfQuestions} questions were generated. Continuing with available questions.`,
          [{ text: 'OK' }]
        );
      }
      // Navigate to QuizAnswer with whatever was generated
      navigation.navigate('QuizAnswer', { 
        quizData: res,
        sourceInfo: `Generated from Excel: ${file.name}`
      });
    } else {
      // No questions generated
      Alert.alert(
        'No Questions Generated',
        'Could not generate questions from this Excel file.\n\nTry:\n• Different Excel file\n• Files with more content\n• Fewer questions (5-10)\n• Easier difficulty'
      );
    }
  } catch (err) {
    console.error('❌ Excel API Error:', err);
    Alert.alert(
      'Error',
      err.message || 'Failed to process the Excel file. Please try again.'
    );
  } finally {
    setLoading(false);
  }
};


  // Format file size for display
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        <Text style={{ color: '#e0f2fe', textAlign: 'center', marginTop: 4 }}>
          Upload Excel files (.xls, .xlsx) to create quizzes
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        {/* File Upload Section */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontWeight: '600', marginBottom: 8, color: '#374151' }}>
            Excel File
          </Text>
          <TouchableOpacity
            onPress={pickDocument}
            disabled={loading}
            style={{
              backgroundColor: '#2563eb',
              paddingVertical: 16,
              borderRadius: 12,
              marginBottom: 16,
              opacity: loading ? 0.6 : 1,
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600', fontSize: 16 }}>
              {file ? 'Change Excel File' : 'Select Excel File'}
            </Text>
          </TouchableOpacity>

          {/* Selected File Info */}
          {file && (
            <View style={{ 
              backgroundColor: '#f8fafc', 
              borderRadius: 12, 
              padding: 16, 
              borderWidth: 1,
              borderColor: '#e2e8f0'
            }}>
              <Text style={{ fontWeight: '700', marginBottom: 8, color: '#1e293b' }}>Selected File:</Text>
              <Text style={{ color: '#475569', marginBottom: 4 }}>📊 {file.name}</Text>
              <Text style={{ color: '#475569', marginBottom: 4 }}>📁 {file.type || 'Excel spreadsheet'}</Text>
              <Text style={{ color: '#475569' }}>📏 {formatFileSize(file.size)}</Text>
            </View>
          )}
        </View>

        {/* Question Type Picker */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontWeight: '600', marginBottom: 8, color: '#374151' }}>
            Question Type
          </Text>
          <View style={{
            borderWidth: 1,
            borderColor: '#d1d5db',
            borderRadius: 12,
            backgroundColor: 'white',
            overflow: 'hidden',
          }}>
            <Picker
              selectedValue={questionType}
              onValueChange={setQuestionType}
              enabled={!loading}
              style={{ height: 50, color: '#1f2937' }}
            >
              <Picker.Item label="Select Question Type" value="default" />
              <Picker.Item label="Multiple Choice" value="mcq" />
              <Picker.Item label="True/False" value="true_false" />
              <Picker.Item label="Both Types" value="both" />
            </Picker>
          </View>
        </View>

        {/* Number of Questions Picker */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontWeight: '600', marginBottom: 8, color: '#374151' }}>
            Number of Questions
          </Text>
          <View style={{
            borderWidth: 1,
            borderColor: '#d1d5db',
            borderRadius: 12,
            backgroundColor: 'white',
            overflow: 'hidden',
          }}>
            <Picker
              selectedValue={numberOfQuestions}
              onValueChange={setNumberOfQuestions}
              enabled={!loading}
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
        </View>

        {/* Difficulty Picker */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontWeight: '600', marginBottom: 8, color: '#374151' }}>
            Difficulty Level
          </Text>
          <View style={{
            borderWidth: 1,
            borderColor: '#d1d5db',
            borderRadius: 12,
            backgroundColor: 'white',
            overflow: 'hidden',
          }}>
            <Picker
              selectedValue={difficulty}
              onValueChange={setDifficulty}
              enabled={!loading}
              style={{ height: 50, color: '#1f2937' }}
            >
              <Picker.Item label="Select difficulty" value="" />
              <Picker.Item label="Easy" value="easy" />
              <Picker.Item label="Medium" value="medium" />
              <Picker.Item label="Hard" value="hard" />
            </Picker>
          </View>
        </View>

        {/* Generate Button */}
        {loading ? (
          <View style={{ paddingVertical: 16, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={{ marginTop: 12, color: '#6b7280', textAlign: 'center' }}>
              Processing Excel file...{'\n'}This may take a moment
            </Text>
          </View>
        ) : (
          <LinearGradient
            colors={['#2563eb', '#4f46e5']}
            style={{ borderRadius: 12, overflow: 'hidden' }}
          >
            <TouchableOpacity 
              onPress={handleGenerate} 
              disabled={!file || loading}
              style={{ 
                paddingVertical: 16,
                alignItems: 'center',
                opacity: (!file || loading) ? 0.6 : 1
              }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 18 }}>
                Generate Quiz from Excel
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        )}

        {/* Help Text */}
        <View style={{ 
          marginTop: 24,
          padding: 16,
          backgroundColor: '#f0f9ff',
          borderRadius: 12,
          borderLeftWidth: 4,
          borderLeftColor: '#0ea5e9'
        }}>
          <Text style={{ 
            color: '#0369a1',
            fontSize: 14,
            textAlign: 'center',
            lineHeight: 20
          }}>
            💡 <Text style={{ fontWeight: '600' }}>Best for Excel:</Text> Financial reports, 
            data analysis, technical spreadsheets, educational data, and documents with 
            substantial text content in cells.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default GenerateFromExcel;