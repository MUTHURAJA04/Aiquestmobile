import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import CustomModal from "../../components/common/CustomModal";


const SavedQuizzes = ({ route }) => {
  const { savedQuizzes } = route.params;

  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleQuizPress = (quiz) => {
    setSelectedQuiz(quiz);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedQuiz(null);
  };

  const renderQuizItem = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => handleQuizPress(item)}
      className="bg-white p-4 rounded-xl mb-4 shadow-md border border-gray-200"
    >
      <Text className="text-lg font-bold text-blue-900 mb-1">
        Quiz {index + 1}
      </Text>
      <Text className="text-gray-700">Difficulty: {item.difficulty}</Text>
      <Text className="text-gray-700">Type: {item.question_type}</Text>
      <Text className="text-gray-700">Content Type: {item.content_type?.join(', ')}</Text>
      <Text className="text-gray-700 mb-2">
        Questions: {item.number_question}
      </Text>

      <Text className="text-sm font-semibold text-gray-800 mb-1">Preview:</Text>
      {item.questions.slice(0, 2).map((q, idx) => (
        <Text key={idx} className="text-gray-600 text-sm mb-1">
          {idx + 1}. {q.question}
        </Text>
      ))}
      <Text className="text-blue-500 mt-2 text-sm">Tap to view all questions</Text>
    </TouchableOpacity>
  );

  const renderQuestion = ({ item, index }) => (
    <View className="mb-4">
      <Text className="text-gray-800 font-medium">
        {index + 1}. {item.question}
      </Text>
      <Text className="text-sm text-gray-500">Answer: {item.answer}</Text>
      <View className="h-px bg-gray-200 my-2" />
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-10">
      <Text className="text-2xl font-bold text-blue-900 mb-4 text-center">
        Saved Quizzes
      </Text>

      {savedQuizzes?.length > 0 ? (
        <FlatList
          data={savedQuizzes}
          keyExtractor={(item) => item.id}
          renderItem={renderQuizItem}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <Text className="text-gray-500 text-center mt-4">
          No saved quizzes found.
        </Text>
      )}

      {/* Modal with FlatList for questions */}
      <CustomModal
        visible={modalVisible}
        onClose={closeModal}
        title="All Questions"
        scrollable={false}
      >
        {selectedQuiz?.questions ? (
          <FlatList
            data={selectedQuiz.questions}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderQuestion}
            showsVerticalScrollIndicator={true}
            style={{ maxHeight: 400 }}
            contentContainerStyle={{ paddingBottom: 8 }}
          />
        ) : (
          <Text className="text-gray-500">No questions available</Text>
        )}
      </CustomModal>
    </View>
  );
};

export default SavedQuizzes;
