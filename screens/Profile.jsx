import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserDashboardApi, getCredits } from "../services/apiClient";
import { PieChart } from "react-native-chart-kit";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import CustomModal from "../components/CustomModal";
import CustomLoader from "../components/CustomLoader";
import CreditsRibbon from "./CreditsRibbon";

const screenWidth = Dimensions.get("window").width;

// 🔹 Helper function: derive stats from saved_quizzes
const generateStatsFromQuizzes = (savedQuizzes = []) => {
  const stats = {
    by_difficulty: { easy: 0, medium: 0, hard: 0 },
    by_question_type: { mcq: 0, true_false: 0, both: 0 },
  };

  savedQuizzes.forEach((quiz) => {
    // Normalize difficulty
    const diff = quiz.difficulty?.toLowerCase();
    if (diff && stats.by_difficulty[diff] !== undefined) {
      stats.by_difficulty[diff] += 1;
    }

    // Handle question type - use the actual type from API
    let type = quiz.question_type?.toLowerCase();
    
    // For quizzes that have mixed types (both), we need to check individual questions
    if (type === "both") {
      stats.by_question_type.both += 1;
    } else if (type === "true_false" || type === "true/false") {
      stats.by_question_type.true_false += 1;
    } else if (type === "mcq") {
      stats.by_question_type.mcq += 1;
    }
  });

  return stats;
};

const Profile = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", content: "" });
  const [credits, setCredits] = useState(0);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      setUser(null);
      navigation.replace("Home");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const onUserIconPress = () => {
    Alert.alert("Logout", "Do you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "OK", onPress: () => handleLogout() },
    ]);
  };

  const openModal = (title, content) => {
    setModalContent({ title, content });
    setModalVisible(true);
  };

  // const fetchUserDashboard = async () => {
  //   try {
  //     const response = await UserDashboardApi();
  //     console.log("Dashboard API Response:", JSON.stringify(response, null, 2));
  //     setUser(response);
  //   } catch (error) {
  //     console.error("❌ Failed to fetch dashboard:", error.message);
  //     Alert.alert(
  //       "Error",
  //       error.message === "Network Error"
  //         ? "Unable to connect to server. Redirecting to Home."
  //         : "Something went wrong. Please try again.",
  //       [{ text: "OK", onPress: () => navigation.replace("Home") }]
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const fetchUserDashboard = async () => {
  try {
    const response = await UserDashboardApi();
    console.log("Dashboard API Response:", JSON.stringify(response, null, 2));
    
    if (response.status === 0) {
      throw new Error(response.message || "Failed to fetch dashboard");
    }
    
    setUser(response);
  } catch (error) {
    console.error("❌ Failed to fetch dashboard:", error.message);
    Alert.alert(
      "Error",
      error.message === "Network Error"
        ? "Unable to connect to server. Redirecting to Home."
        : "Something went wrong. Please try again.",
      [{ text: "OK", onPress: () => navigation.replace("Home") }]
    );
  } finally {
    setLoading(false);
  }
};


  const fetchCredits = async () => {
    try {
      const res = await getCredits();
      setCredits(res.remaining_credits || 0);
    } catch (err) {
      console.error("❌ Failed to fetch credits:", err.message);
    }
  };

  useEffect(() => {
    fetchUserDashboard();
    fetchCredits();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <CustomLoader />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <Text className="text-red-500 font-semibold text-center">
          Failed to load profile data.
        </Text>
      </View>
    );
  }

  // ------------------ Extract Data ------------------
  const fullName = user.full_name || user.fullName || "User";
  const email = user.email || "No email";
  // const quizStreakDays = user.quiz_streak_days || 0;
  const totalAttempts = user.total_attempts || 0;
  // const totalScore = user.total_score || 0;
  const flashcardCount = user.flashcard_count || 0;
  const summaryCount = user.summary_count || 0;
  const savedQuizzes = user.saved_quizzes || [];
  // const weakTopics = user.weak_topics || [];

  // ------------------ Generate Stats ------------------
  const derivedStats = generateStatsFromQuizzes(savedQuizzes);

  const attemptStats = {
    by_difficulty: {
      easy: derivedStats.by_difficulty.easy + (user.attempt_stats?.by_difficulty?.easy || 0),
      medium: derivedStats.by_difficulty.medium + (user.attempt_stats?.by_difficulty?.medium || 0),
      hard: derivedStats.by_difficulty.hard + (user.attempt_stats?.by_difficulty?.hard || 0),
    },
    by_question_type: {
      mcq: derivedStats.by_question_type.mcq + (user.attempt_stats?.by_question_type?.mcq || 0),
      true_false:
        derivedStats.by_question_type.true_false +
        (user.attempt_stats?.by_question_type?.true_false || 0),
      both: derivedStats.by_question_type.both + (user.attempt_stats?.by_question_type?.both || 0),
    },
  };

  const difficultyStats = attemptStats.by_difficulty;
  const questionTypeStats = attemptStats.by_question_type;

  const pieData = [
    {
      name: "Easy",
      population: difficultyStats.easy || 0,
      color: "#60a5fa",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
    {
      name: "Medium",
      population: difficultyStats.medium || 0,
      color: "#fbbf24",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
    {
      name: "Hard",
      population: difficultyStats.hard || 0,
      color: "#f87171",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
  ];

  const mcqAttempts = questionTypeStats.mcq || 0;
  const trueFalseAttempts = questionTypeStats.true_false || 0;
  const bothAttempts = questionTypeStats.both || 0;

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
        <Text className="text-2xl font-extrabold text-center text-blue-900 mb-4">
          Welcome, {fullName}
        </Text>

        {/* ================== User Info & Credits Ribbon ================== */}
        <View className="bg-gray-100 p-5 rounded-2xl mb-6 shadow-sm">
          <View className="flex-row items-center justify-between relative">
            <View className="flex-row items-center flex-1 mr-4 min-w-0">
              <View className="flex-shrink">
                <CreditsRibbon
                  credits={credits}
                  onPress={() => navigation.navigate("Pricing")}
                />
              </View>
            </View>

            <View>
              <TouchableOpacity
                onPress={onUserIconPress}
                className="flex-row items-center bg-blue-600 rounded-full px-3 py-1"
                activeOpacity={0.8}
                style={{ minWidth: 100 }}
              >
                <Icon name="account-circle" size={32} color="white" />
                <Text
                  className="text-white text-sm ml-2"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ maxWidth: 120 }}
                >
                  {fullName}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ================== Stats Cards ================== */}
        <View className="flex-row mb-6">
  <TouchableOpacity
    onPress={() =>
      openModal(
        "Total Attempts",
        `You have attempted ${totalAttempts} quizzes with a total score of ${totalScore}.`
      )
    }
    className="bg-green-100 px-4 py-3 rounded-2xl flex-1 mx-1 items-center shadow-sm"
  >
    <Icon name="check-circle-outline" size={24} color="#065f46" />
    <Text className="text-xs text-gray-700 mt-1">Quiz Attempts</Text>
    <Text className="text-green-900 font-bold text-lg">{totalAttempts}</Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() =>
      navigation.navigate("SavedQuizzes", { savedQuizzes })
    }
    className="bg-yellow-100 px-4 py-3 rounded-2xl flex-1 mx-1 items-center shadow-sm"
  >
    <Icon name="bookmark-outline" size={24} color="#92400e" />
    <Text className="text-xs text-gray-700 mt-1">Saved</Text>
    <Text className="text-yellow-900 font-bold text-lg">{savedQuizzes.length}</Text>
  </TouchableOpacity>
</View>

<View className="flex-row mb-6">
  <TouchableOpacity
    onPress={() =>
      openModal("Flashcards", `You have created ${flashcardCount} flashcards.`)
    }
    className="bg-purple-100 px-4 py-3 rounded-2xl flex-1 mx-1 items-center shadow-sm"
  >
    <Icon name="cards-outline" size={24} color="#5b21b6" />
    <Text className="text-xs text-gray-700 mt-1">Flashcards</Text>
    <Text className="text-purple-900 font-bold text-lg">{flashcardCount}</Text>
  </TouchableOpacity>

  <TouchableOpacity
    onPress={() =>
      openModal("Summaries", `You have created ${summaryCount} summaries.`)
    }
    className="bg-pink-100 px-4 py-3 rounded-2xl flex-1 mx-1 items-center shadow-sm"
  >
    <Icon name="text-box-outline" size={24} color="#9d174d" />
    <Text className="text-xs text-gray-700 mt-1">Summaries</Text>
    <Text className="text-pink-900 font-bold text-lg">{summaryCount}</Text>
  </TouchableOpacity>
</View>




        {/* ================== Attempts by Question Type ================== */}
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
              <Text className="text-gray-900">{mcqAttempts}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-700">True/False</Text>
              <Text className="text-gray-900">{trueFalseAttempts}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-700">Mixed (Both)</Text>
              <Text className="text-gray-900">{bothAttempts}</Text>
            </View>
          </View>
        </View>

        {/* ================== Pie Chart by Difficulty ================== */}
        <View className="mb-6 bg-gray-50 p-4 rounded-2xl shadow-sm">
          <View className="flex-row items-center mb-2">
            <Icon name="chart-pie" size={20} color="#4b5563" />
            <Text className="ml-2 text-lg font-semibold text-gray-800">
              Attempts by Difficulty
            </Text>
          </View>
          {pieData.some((item) => item.population > 0) ? (
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
            <Text className="text-gray-500 mt-2">No difficulty data available.</Text>
          )}
        </View>

        {/* ================== Weak Topics ================== */}
        {/* <View className="mb-10 bg-gray-50 p-4 rounded-2xl shadow-sm">
          <View className="flex-row items-center mb-2">
            <Icon name="alert-circle-outline" size={20} color="#4b5563" />
            <Text className="ml-2 text-lg font-semibold text-gray-800">Weak Topics</Text>
          </View>
          {weakTopics.length > 0 ? (
            weakTopics.map((topic, index) => (
              <Text key={index} className="text-gray-700 mb-1 ml-1">
                • {topic}
              </Text>
            ))
          ) : (
            <Text className="text-gray-500">No weak topics available.</Text>
          )}
        </View> */}

        {/* ================== Upgrade Button ================== */}
        <View className="mb-10">
          <TouchableOpacity
            onPress={() => navigation.navigate("Pricing")}
            className="bg-blue-500 p-4 rounded-2xl shadow-lg"
          >
            <Text className="text-white font-bold text-center text-lg">
              Upgrade to Premium 🚀
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

export default Profile;