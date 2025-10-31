import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  Linking,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useAppContext } from "../../components/context/AppContext";
import { useAuth } from "../../components/navigations/AuthContext";
import { getCredits } from "../../services/apiClient";

// 🧠 Quiz Images
import textquiz from "../../assets/texttoquiz.png";
import imagequiz from "../../assets/imagetoquiz.png";
import audioquiz from "../../assets/audiotoquiz.png";
import videoquiz from "../../assets/videtoquiz.png";
import pdfquiz from "../../assets/pdftoquiz.png";
import wordquiz from "../../assets/wordtoquiz.png";
import pptquiz from "../../assets/ppttoquiz.png";
import excelquiz from "../../assets/exceltoquiz.png";
import urlquiz from "../../assets/urltoquiz.png";
import wikipediaquiz from "../../assets/wikipediatoquiz.png";

const SchedulerList = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [remainingCredits, setRemainingCredits] = useState(0);
  const { selectedPlan } = useAppContext();
  const { user } = useAuth();
  const isTrial = selectedPlan?.title === "TRIAL";

  // ✅ Fetch credits from API
  const fetchCredits = async () => {
    try {
      const res = await getCredits();
      const creditValue = res.remaining_credits || 0;
      setRemainingCredits(creditValue);
    } catch (err) {
      console.log("Credits fetch error:", err);
      setRemainingCredits(0);
    }
  };

  useEffect(() => {
    fetchCredits();
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Centralized credit & plan validation
  const handleScheduleNowClick = (path) => {
    if (!user) {
      Alert.alert("Login Required", "Please log in to continue.");
      navigation.navigate("Login");
      return;
    }

    // 🟠 No credits available
    if (remainingCredits <= 0) {
      Alert.alert(
        "No Credits Available",
        "You have no remaining credits. Please buy a plan to continue.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Go to Plans", onPress: () => Linking.openURL("https://dev.digiaiquest.com/pricing") },
        ]
      );
      return;
    }

    // 🟡 Trial users only get Text Quiz
    if (isTrial && path !== "ScheduleText") {
      Alert.alert(
        "Trial Plan Restriction",
        "Trial users can only access Text Quiz scheduling. Upgrade your plan to use other schedulers.",
        [{ text: "OK" }]
      );
      return;
    }

    // ✅ Enough credits — allow navigation
    navigation.navigate(path);
  };

  // ✅ Data for all schedulers
  const schedulersData = [
    { icon: "text-fields", title: "Text Quiz", image: textquiz, path: "ScheduleText" },
    { icon: "image", title: "Image Quiz", image: imagequiz, path: "ScheduleImage" },
    { icon: "audiotrack", title: "Audio Quiz", image: audioquiz, path: "ScheduleAudio" },
    { icon: "video-library", title: "Video Quiz", image: videoquiz, path: "ScheduleVideo" },
    { icon: "picture-as-pdf", title: "PDF Quiz", image: pdfquiz, path: "SchedulePdf" },
    { icon: "insert-drive-file", title: "Word Quiz", image: wordquiz, path: "ScheduleWord" },
    { icon: "slideshow", title: "PPT Quiz", image: pptquiz, path: "SchedulePpt" },
    { icon: "table-chart", title: "Excel Quiz", image: excelquiz, path: "ScheduleExcel" },
    { icon: "language", title: "URL Quiz", image: urlquiz, path: "ScheduleUrl" },
    { icon: "school", title: "Wikipedia Quiz", image: wikipediaquiz, path: "ScheduleWikipedia" },
  ];

  if (loading) {
    return (
      <LinearGradient colors={["#E3F2FD", "#F5F7FA"]} className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#3590FF" />
        <Text className="mt-4 text-base text-gray-600">Preparing your AI tools...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#F8FAFF", "#E9F0FF"]} className="flex-1">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 20 }}>
        {/* Header */}
        <View className="px-6 mt-6 mb-5">
          <Text className="text-3xl font-bold text-gray-800 text-center">AI Quiz Scheduler</Text>
          <Text className="text-base text-gray-500 text-center mt-2">
            Pick a type and start generating your quiz instantly.
          </Text>
        </View>

        {/* Credits info */}
        <View className="bg-blue-100 rounded-2xl px-4 py-3 mx-6 mb-6">
          <Text className="text-blue-900 text-center font-medium">
            Remaining Credits: <Text className="font-bold">{remainingCredits}</Text>
          </Text>
        </View>

        {/* Grid Cards */}
        <View className="flex-row flex-wrap justify-center">
          {schedulersData.map((scheduler, index) => {
            const isDisabled = isTrial && scheduler.path !== "ScheduleText";
            return (
              <Animated.View key={index} style={{ width: "90%", marginBottom: 18 }}>
                <LinearGradient
                  colors={["#ffffff", "#f4f8ff"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="rounded-3xl p-4 shadow-md"
                >
                  <View className="flex-row items-center mb-3">
                    <View className="p-3 bg-blue-50 rounded-full">
                      <MaterialIcons name={scheduler.icon} size={28} color="#3590FF" />
                    </View>
                    <Text className="ml-3 text-lg font-semibold text-gray-800">{scheduler.title}</Text>
                  </View>

                  <Image
                    source={scheduler.image}
                    className="w-full h-44 rounded-2xl mb-4"
                    resizeMode="cover"
                  />

                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={isDisabled}
                    onPress={() => handleScheduleNowClick(scheduler.path)}
                  >
                    <LinearGradient
                      colors={
                        isDisabled ? ["#d1d5db", "#cbd5e1"] : ["#3590FF", "#56A9FF"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="rounded-xl py-3"
                    >
                      <Text className="text-center text-white text-lg font-semibold">
                        {isDisabled ? "Unavailable" : "Schedule Now"}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </Animated.View>
            );
          })}
        </View>

        {/* Footer Note */}
        <View className="mt-6 mb-10 px-6">
          <Text className="text-center text-gray-500 text-sm">
            {isTrial
              ? "Trial users can only access Text Quiz scheduling."
              : "Upgrade your plan anytime to unlock all AI quiz schedulers."}
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default SchedulerList;
