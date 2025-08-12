import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { submitQuiz } from '../services/apiClient';

const QuizAnswer = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { quizData } = route.params;

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answerExplanation, setAnswerExplanation] = useState([]);

  useEffect(() => {
    if (!quizData?.questions?.length) {
      navigation.navigate('Services');
    }
  }, [quizData, navigation]);

  useEffect(() => {
    if (!isSubmitted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmitAll(true);
    }
  }, [timeLeft, isSubmitted]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelect = (qIndex, option) => {
    if (!isSubmitted && timeLeft > 0) {
      setSelectedAnswers((prev) => ({ ...prev, [qIndex]: option }));
    }
  };

  const handleSubmitAll = async (autoSubmitted = false) => {
    if (isSubmitted) return;

    setIsSubmitting(true);
    
    try {
      const user_answers = {};
      quizData.questions.forEach((q, i) => {
        const selectedOptionIndex = q.options.indexOf(selectedAnswers[i]);
        if (selectedOptionIndex !== -1) {
          user_answers[q._id] = selectedOptionIndex;
        }
      });

      const result = await submitQuiz(quizData.quiz_id, selectedAnswers);
      setScore(result.score);
      setAnswerExplanation(result.answer_explanation || []);
      setIsSubmitted(true);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong while submitting the quiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackPress = () => {
    if (!isSubmitted) {
      Alert.alert(
        'Exit Quiz',
        'Are you sure you want to exit? Your progress will be lost.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', onPress: () => navigation.navigate('Services') }
        ]
      );
    } else {
      navigation.navigate('Services');
    }
  };

  if (!quizData?.questions?.length) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-700">No quiz data available</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="px-4 pt-12 pb-6 bg-white shadow-sm">
          <TouchableOpacity 
            onPress={handleBackPress}
            className="absolute left-4 top-12 p-2"
          >
            {/* <ArrowLeft size={24} color="#4b5563" /> */}
          </TouchableOpacity>
          
          <Text className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-300 mb-2">
            Quiz Answers
          </Text>
          
          {!isSubmitted && (
            <Text className="text-center text-lg font-semibold text-red-500">
              Time Remaining: {formatTime(timeLeft)}
            </Text>
          )}
        </View>

        {/* Questions */}
        <View className="px-4 mt-4 space-y-6">
          {quizData.questions.map((q, index) => {
            const correctAnswer = q.answer;
            const userAnswer = selectedAnswers[index];

            return (
              <View 
                key={index} 
                className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm"
              >
                <Text className="text-lg font-semibold text-gray-800 mb-4">
                  {index + 1}. {q.question}
                </Text>
                
                <View className="space-y-3">
                  {q.options.map((opt, idx) => {
                    const isCorrect = opt === correctAnswer;
                    const isSelected = opt === userAnswer;

                    let bgColor = 'bg-gray-50';
                    let borderColor = 'border-gray-300';
                    let textColor = 'text-gray-700';

                    if (isSubmitted) {
                      if (isCorrect) {
                        bgColor = 'bg-green-50';
                        borderColor = 'border-green-500';
                        textColor = 'text-green-800';
                      } else if (isSelected) {
                        bgColor = 'bg-red-50';
                        borderColor = 'border-red-500';
                        textColor = 'text-red-800';
                      }
                    } else if (isSelected) {
                      bgColor = 'bg-blue-50';
                      borderColor = 'border-blue-500';
                      textColor = 'text-blue-800';
                    }

                    return (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => handleSelect(index, opt)}
                        disabled={isSubmitted || timeLeft <= 0}
                        className={`p-4 rounded-xl border ${bgColor} ${borderColor}`}
                      >
                        <Text className={`text-base font-medium  ${textColor}`}>
                          {opt}
                          {isSubmitted && isCorrect && (
                            <Text className="ml-2  font-semibold text-green-600">
                              (Correct)
                            </Text>
                          )}
                          {isSubmitted && isSelected && !isCorrect && (
                            <Text className="ml-2 font-semibold text-red-600">
                              (Your Answer)
                            </Text>
                          )}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Explanation */}
                {isSubmitted && answerExplanation[index] && (
                  <View className="mt-6 p-4 rounded-lg bg-yellow-50 flex-row items-start gap-3">
                    <View className="w-6 h-6 items-center justify-center bg-yellow-500 rounded-full">
                      <Text className="text-xs font-bold text-black">i</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-gray-800 mb-1">
                        Explanation
                      </Text>
                      <Text className="text-sm text-gray-700">
                        {answerExplanation[index]?.trim() || 
                          'No explanation provided for this question.'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Results */}
        {isSubmitted && (
          <View className="items-center mt-10 px-4">
            {/* <CheckCircle size={48} color="#10b981" /> */}
            <Text className="text-2xl font-bold text-gray-800 mt-4">
              Quiz Completed!
            </Text>
            
            <View className="items-center my-4">
              <Text className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">
                {score}
              </Text>
              <Text className="text-sm text-gray-600">
                Score out of {quizData.questions.length}
              </Text>
            </View>
            
            <Text className="text-blue-500 text-base font-medium text-center">
              {score === quizData.questions.length
                ? 'Perfect! 🎉'
                : score >= quizData.questions.length / 2
                  ? 'Great job! 👍'
                  : 'Keep practicing! 💪'}
            </Text>
          </View>
        )}

        {/* Submit Button */}
        {!isSubmitted && (
          <View className="items-center mt-8 px-4">
            <TouchableOpacity
              onPress={() => handleSubmitAll(false)}
              disabled={timeLeft <= 0 || isSubmitting}
              className="bg-blue-500  px-10 py-4 rounded-full shadow-md"
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-xl font-bold">
                  Submit All Answers
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Generate Another Button */}
        {isSubmitted && (
          <View className="items-center mt-8 px-4">
            <TouchableOpacity
              onPress={() => navigation.navigate('Services')}
              className="bg-blue-500  px-10 py-4 rounded-full shadow-md flex-row items-center gap-2"
            >
              {/* <Repeat size={20} color="white" /> */}
              <Text className="text-white text-xl font-bold">
                Generate Another Quiz
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default QuizAnswer;



