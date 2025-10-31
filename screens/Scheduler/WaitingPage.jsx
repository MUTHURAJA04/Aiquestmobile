import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LinearGradient from "react-native-linear-gradient";
import { useTranslation } from "react-i18next";
import { fetchQuizByScheduledId, deleteScheduledQuiz } from "../../api/sheduler";
import { useAppContext } from "../../Context/useAppContext";

const WaitingPage = () => {
  const [quiz, setQuiz] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [ready, setReady] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const navigation = useNavigation();
  const { t } = useTranslation();
  const { credits, setCredits, updateUserPlanAndCredits, user } = useAppContext();

  useEffect(() => {
    let timer;

    const loadQuiz = async () => {
      const userId = await AsyncStorage.getItem("userid");
      const scheduledId = await AsyncStorage.getItem("schedule_id");

      if (!userId || !scheduledId) {
        navigation.navigate("Scheduler");
        return;
      }

      try {
        const res = await fetchQuizByScheduledId(userId, scheduledId);
        if (res.status !== "success" || !res.quiz) return;

        const scheduledQuiz = res.quiz;
        setQuiz(scheduledQuiz);

        const scheduledTime =
          scheduledQuiz.scheduled_time ||
          scheduledQuiz.created_at ||
          new Date().toISOString();

        await AsyncStorage.setItem("scheduled_time", scheduledTime);

        const targetTime = new Date(scheduledTime).getTime();

        timer = setInterval(async () => {
          const diff = targetTime - Date.now();
          if (diff <= 0) {
            clearInterval(timer);
            setTimeLeft(0);
            setReady(true);

            const scheduledKey = `credits_deducted_${scheduledId}`;
            const deducted = await AsyncStorage.getItem(scheduledKey);

            if (!deducted) {
              const remaining = credits - 1;
              setCredits(remaining);
              updateUserPlanAndCredits(user?.subscription?.plan || "TRIAL", remaining);
              await AsyncStorage.setItem(scheduledKey, "true");
            }
          } else {
            setTimeLeft(Math.ceil(diff / 1000));
          }
        }, 1000);
      } catch (err) {
        console.error("Error loading quiz:", err);
      }
    };

    loadQuiz();

    return () => timer && clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    if (seconds == null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleShowResult = () => {
    if (quiz) navigation.navigate("Answer", { quiz });
  };

  const handleDeleteQuiz = async () => {
    const scheduledId = await AsyncStorage.getItem("schedule_id");
    if (!scheduledId || isDeleting) return;

    setIsDeleting(true);
    try {
      const res = await deleteScheduledQuiz(scheduledId);
      if (res?.status === 1 || res?.success) {
        setDeleted(true);
        setQuiz(null);
      } else {
        console.log("Delete failed:", res?.message);
      }
    } catch (err) {
      console.error("Error deleting quiz:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white px-4">
      <View className="bg-white rounded-2xl shadow-xl p-6 w-11/12 items-center border border-gray-200">
        <Text className="text-2xl font-bold mb-6 text-gray-800">
          {t("waiting_page.title")}
        </Text>

        {/* Deleted State */}
        {deleted ? (
          <View className="items-center">
            <Text className="text-gray-500 mb-4 font-medium">
              {t("waiting_page.deleted_message")}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Scheduler")}
              className="w-full"
            >
              <LinearGradient
                colors={["#3590FF", "#BBFBFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-lg py-3"
              >
                <Text className="text-center text-white font-semibold">
                  {t("waiting_page.go_back")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Quiz Info */}
            {quiz && (
              <View className="mb-6">
                <Text className="text-gray-600">
                  <Text className="font-medium text-gray-800">
                    {t("waiting_page.quiz")}:
                  </Text>{" "}
                  {quiz.title || "—"}
                </Text>
                <Text className="text-gray-600">
                  <Text className="font-medium text-gray-800">
                    {t("waiting_page.questions")}:
                  </Text>{" "}
                  {quiz.number_question || "—"}
                </Text>
              </View>
            )}

            {/* Countdown */}
            <View className="items-center mb-6 min-h-[80px]">
              {quiz && timeLeft !== null ? (
                <>
                  <Text className="text-xl font-semibold text-green-600">
                    ⏳ {formatTime(timeLeft)}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-1">
                    {t("waiting_page.scheduled")}:{" "}
                    <Text className="font-medium">
                      {new Date(
                        AsyncStorage.getItem("scheduled_time")
                      ).toLocaleString()}
                    </Text>
                  </Text>
                </>
              ) : (
                <>
                  <ActivityIndicator size="small" color="#3590FF" />
                  <Text className="text-sm font-medium text-blue-500 mt-2">
                    {t("waiting_page.loading")}
                  </Text>
                </>
              )}
            </View>

            {/* Show Result */}
            <TouchableOpacity
              onPress={handleShowResult}
              disabled={!quiz}
              className="w-full mb-3"
            >
              <LinearGradient
                colors={["#3590FF", "#BBFBFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-lg py-3"
              >
                <Text className="text-center text-white font-semibold">
                  {t("waiting_page.show_result")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Delete Quiz */}
            <TouchableOpacity
              onPress={handleDeleteQuiz}
              disabled={isDeleting}
              className="w-full"
            >
              <LinearGradient
                colors={["#3590FF", "#BBFBFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="rounded-lg py-3 flex-row justify-center items-center"
              >
                <MaterialIcons
                  name="delete"
                  size={18}
                  color="white"
                  style={{ marginRight: 6 }}
                />
                <Text className="text-center text-white font-semibold">
                  {isDeleting
                    ? t("waiting_page.deleting")
                    : t("waiting_page.delete_quiz")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default WaitingPage;
