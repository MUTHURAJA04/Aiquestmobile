import React from "react";
import { View, Text, FlatList } from "react-native";

const SavedQuizzes = ({ route }) => {
  const { savedQuizzes } = route.params;

  return (
    <View className="flex-1 bg-white px-4 pt-10">
      <Text className="text-2xl font-bold text-blue-900 mb-4 text-center">
        Saved Quizzes
      </Text>

      {savedQuizzes?.length > 0 ? (
        <FlatList
          data={savedQuizzes}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View className="bg-gray-100 p-4 rounded-xl mb-3 shadow-sm">
              <Text className="text-gray-900 font-semibold">Quiz {index + 1}</Text>
              <Text className="text-gray-600 text-sm mt-1">{JSON.stringify(item)}</Text>
            </View>
          )}
        />
      ) : (
        <Text className="text-gray-500 text-center mt-4">
          No saved quizzes found.
        </Text>
      )}
    </View>
  );
};

export default SavedQuizzes;
