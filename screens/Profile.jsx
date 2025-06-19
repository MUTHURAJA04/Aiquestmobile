import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { UserDashboardApi } from "../services/apiClient";
import { PieChart } from "react-native-chart-kit";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import CustomModal from "../components/CustomModal";
import CustomLoader from "../components/CustomLoader";

const screenWidth = Dimensions.get("window").width;

const Profile = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", content: "" });

  const openModal = (title, content) => {
    setModalContent({ title, content });
    setModalVisible(true);
  };

  const fetchUserDashboard = async () => {
    try {
      const response = await UserDashboardApi();
      console.log("\ud83d\udce6 Profile response:", response);
      setUser(response);
    } catch (error) {
      console.error("\u274c Failed to fetch dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDashboard();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
      <CustomLoader/>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500 font-semibold">
          Failed to load profile data.
        </Text>
      </View>
    );
  }

  const difficultyStats = user.attempt_stats?.by_difficulty || {};
  const pieData = Object.entries(difficultyStats).map(
    ([difficulty, count], index) => ({
      name: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
      population: count,
      color: ["#60a5fa", "#fbbf24", "#f87171"][index % 3],
      legendFontColor: "#333",
      legendFontSize: 14,
    })
  );

  return (
    <>
      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalContent.title}
      >
        <Text className="text-gray-700 mb-4">{modalContent.content}</Text>
      
      </CustomModal>

      <ScrollView className="flex-1 bg-white px-6 pt-10 pb-10">
        <Text className="text-2xl font-extrabold text-center text-blue-900 mb-2">
          Welcome, {user.full_name}
        </Text>

        <View className="bg-gray-100 p-5 rounded-2xl mb-6 shadow-sm">
          <View className="flex-row items-center">
            <Icon name="email-outline" size={20} color="#1f2937" />
            <Text className="ml-3 text-gray-700 font-semibold w-16">Email</Text>
            <Text className="text-gray-900 flex-1">{user.email}</Text>
          </View>
        </View>

        <View className="flex-row justify-between mb-6 space-x-3">
          <TouchableOpacity
            onPress={() =>
              openModal(
                "Streak Days",
                `You have maintained a streak of ${user.quiz_streak_days} day(s). Keep it going!`
              )
            }
            className="bg-blue-100 px-4 py-3 rounded-2xl w-[30%] items-center shadow-sm"
          >
            <Icon name="fire" size={24} color="#1e3a8a" />
            <Text className="text-xs text-gray-700 mt-1">Streak</Text>
            <Text className="text-blue-900 font-bold text-lg">
              {user.quiz_streak_days}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              openModal(
                "Total Attempts",
                `You have attempted ${user.total_attempts} quizzes so far.`
              )
            }
            className="bg-green-100 px-4 py-3 rounded-2xl w-[30%] items-center shadow-sm"
          >
            <Icon name="check-circle-outline" size={24} color="#065f46" />
            <Text className="text-xs text-gray-700 mt-1">Attempts</Text>
            <Text className="text-green-900 font-bold text-lg">
              {user.total_attempts}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("SavedQuizzes", {
                savedQuizzes: user.saved_quizzes,
              })
            }
            className="bg-yellow-100 px-4 py-3 rounded-2xl w-[30%] items-center shadow-sm"
          >
            <Icon name="bookmark-outline" size={24} color="#92400e" />
            <Text className="text-xs text-gray-700 mt-1">Saved</Text>
            <Text className="text-yellow-900 font-bold text-lg">
              {user.saved_quizzes?.length ?? 0}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mb-6 bg-gray-50 p-4 rounded-2xl shadow-sm">
          <View className="flex-row items-center mb-2">
            <Icon name="format-list-checks" size={20} color="#4b5563" />
            <Text className="ml-2 text-lg font-semibold text-gray-800">
              Attempts by Question Type
            </Text>
          </View>
          <View className="space-y-2 mt-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-700">MCQ</Text>
              <Text className="text-gray-900">
                {user.attempt_stats?.by_question_type?.mcq ?? 0}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-700">True/False</Text>
              <Text className="text-gray-900">
                {user.attempt_stats?.by_question_type?.true_false ?? 0}
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-6 bg-gray-50 p-4 rounded-2xl shadow-sm">
          <View className="flex-row items-center mb-2">
            <Icon name="chart-pie" size={20} color="#4b5563" />
            <Text className="ml-2 text-lg font-semibold text-gray-800">
              Attempts by Difficulty
            </Text>
          </View>
          {pieData.length > 0 ? (
            <PieChart
              data={pieData}
              width={screenWidth - 40}
              height={200}
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: () => "#333",
              }}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"10"}
              absolute
            />
          ) : (
            <Text className="text-gray-500 mt-2">
              No difficulty data available.
            </Text>
          )}
        </View>

        <View className="mb-10 bg-gray-50 p-4 rounded-2xl shadow-sm">
          <View className="flex-row items-center mb-2">
            <Icon name="alert-circle-outline" size={20} color="#4b5563" />
            <Text className="ml-2 text-lg font-semibold text-gray-800">
              Weak Topics
            </Text>
          </View>
          {user.weak_topics?.length > 0 ? (
            user.weak_topics.map((topic, index) => (
              <Text key={index} className="text-gray-700 mb-1 ml-1">
                • {topic}
              </Text>
            ))
          ) : (
            <Text className="text-gray-500">No weak topics available.</Text>
          )}
        </View>

        {/* Upgrade Button */}
        <View className="mb-10">
          <TouchableOpacity
            onPress={() => navigation.navigate("Pricing")}
            className="bg-blue-500 p-4 rounded-2xl shadow-lg"
          >
            <Text className="text-white font-bold text-center text-lg ">
              Upgrade to Premium 🚀
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

export default Profile;