import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const QuizAnswer = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { quizData } = route.params;

  const [selectedAnswers, setSelectedAnswers] = useState(Array(quizData.questions.length).fill(null));
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes
  const [submittedOnTime, setSubmittedOnTime] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false); // ✅ track first answer

  // Timer useEffect
  useEffect(() => {
    if (!quizStarted || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAll(true); // auto-submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // stops if unmounted
  }, [quizStarted, isSubmitted]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${mins}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleSelect = (index, answer) => {
    if (!isSubmitted) {
      const updated = [...selectedAnswers];
      updated[index] = answer;
      setSelectedAnswers(updated);

      if (!quizStarted) setQuizStarted(true); // ✅ start timer on first answer
    }
  };

  const handleSubmitAll = (auto = false) => {
    if (!auto && selectedAnswers.includes(null)) {
      Alert.alert('Validation', 'Please answer all questions before submitting.');
      return;
    }

    let points = 0;
    quizData.questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.answer) points++;
    });

    setScore(points);
    setIsSubmitted(true);
    setSubmittedOnTime(!auto);

    if (auto) {
      Alert.alert("⏱ Time's Up", 'Quiz has been auto-submitted.');
    } else {
      Alert.alert("✅ Submitted", 'You submitted the quiz on time. Great job!');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }} className="px-4 pt-10">
        <Text className="text-3xl font-bold text-center mb-6 text-indigo-700">AI Quiz</Text>
        <Text className="text-center text-lg text-gray-600 mb-4">
          {isSubmitted ? 'Quiz Completed!' : `Time Remaining: ${formatTime(timeLeft)}`}
        </Text>

        {quizData.questions.map((q, index) => {
          const correct = q.answer;
          const selected = selectedAnswers[index];
          return (
            <View key={index} className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
              <Text className="text-lg font-semibold text-indigo-600 mb-3">
                {index + 1}. {q.question}
              </Text>
              {q.options.map((opt, i) => {
                const isSelected = opt === selected;
                const isCorrect = opt === correct;

                let bg = 'bg-gray-100';
                let border = 'border-gray-300';
                let text = 'text-gray-700';

                if (isSubmitted) {
                  if (isCorrect) {
                    bg = 'bg-green-100';
                    border = 'border-green-500';
                    text = 'text-green-800';
                  } else if (isSelected && !isCorrect) {
                    bg = 'bg-red-100';
                    border = 'border-red-500';
                    text = 'text-red-800';
                  }
                } else if (isSelected) {
                  bg = 'bg-blue-100';
                  border = 'border-blue-500';
                  text = 'text-blue-800';
                }

                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleSelect(index, opt)}
                    className={`p-4 mb-2 rounded-xl border ${bg} ${border}`}
                    disabled={isSubmitted}
                  >
                    <Text className={`text-base font-medium ${text}`}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}

        {isSubmitted && (
          <View className="items-center mb-6">
            <Text className="text-2xl font-bold text-green-600">Score: {score} / {quizData.questions.length}</Text>
            <Text className="text-sm text-gray-600 mt-1">
              {score === quizData.questions.length
                ? 'Perfect! 🎉'
                : score >= quizData.questions.length / 2
                  ? 'Good job! 👍'
                  : 'Keep practicing! 💪'}
            </Text>
            <Text className="text-sm mt-2 text-blue-600 font-medium">
              {submittedOnTime ? '⏳ You submitted on time. Great focus!' : '⏱ Submitted automatically when time expired.'}
            </Text>
          </View>
        )}

        {!isSubmitted && (
          <TouchableOpacity
            onPress={() => handleSubmitAll(false)}
            className="bg-indigo-600 mt-8 mb-10 py-4 rounded-2xl items-center shadow-lg"
            disabled={!quizStarted || timeLeft <= 0}
          >
            <Text className="text-white font-bold text-lg">Submit All Answers</Text>
          </TouchableOpacity>
        )}

        {isSubmitted && (
          <TouchableOpacity
            onPress={() => navigation.navigate("Services")}
            className="bg-blue-700 mt-8 mb-10 py-4 rounded-2xl items-center shadow-lg"
          >
            <Text className="text-white font-bold text-lg">Generate Another Quiz</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default QuizAnswer;
