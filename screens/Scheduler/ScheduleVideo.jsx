import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { pick, types } from "@react-native-documents/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createQuizShedule } from "../../services/apiClient"; // your backend API

const ScheduleVideo = ({ navigation }) => {
  const [video, setVideo] = useState(null);
  const [questionType, setQuestionType] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const questionTypeOptions = [
    { label: "True or False", value: "true_false" },
    { label: "MCQ", value: "mcq" },
    { label: "Both", value: "both" },
  ];

  const questionCountOptions = [5, 10, 15, 20, 25];
  const difficultyOptions = [
    { label: "Easy", value: "easy" },
    { label: "Medium", value: "medium" },
    { label: "Hard", value: "hard" },
  ];

  const pickVideo = async () => {
    try {
      const result = await pick({
        type: [types.video],
      });
      if (result && result[0]) {
        setVideo(result[0]);
      }
    } catch (err) {
      Alert.alert("Oops!", "Unable to select video file");
    }
  };

  const validateForm = () => {
    if (!video) return Alert.alert("Oops!", "Please upload a video file.");
    if (!questionType) return Alert.alert("Oops!", "Select question type.");
    if (!questionCount) return Alert.alert("Oops!", "Select number of questions.");
    if (!difficulty) return Alert.alert("Oops!", "Select difficulty level.");
    if (!scheduledTime) return Alert.alert("Oops!", "Choose a schedule time.");
    return true;
  };

  const handleSchedule = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const formData = {
        video,
        question_type: questionType,
        number_question: questionCount,
        difficulty,
        scheduled_time: scheduledTime.toISOString(),
        token,
        language: "en",
        link: "https://dev-api.digiaiquest.com/waiting",
      };

      const res = await createQuizShedule(formData);
      if (res?.status === "success") {
        Alert.alert("Success", "Quiz scheduled successfully!");
        navigation.navigate("WaitingScreen", { schedule: res, quiz: formData });
      } else {
        Alert.alert("Oops!", res?.message || "Failed to schedule quiz.");
      }
    } catch (err) {
      Alert.alert("Oops!", "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-gray-100"
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 mt-6">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-blue-500">
          Schedule From Video
        </Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Form Body */}
      <View className="px-6 mt-8">
        {/* Upload Video */}
        <TouchableOpacity
          onPress={pickVideo}
          activeOpacity={0.8}
          className="border border-gray-300 rounded-2xl bg-white p-5 mb-5"
        >
          <Text className="text-gray-600 text-sm text-center">
            {video ? `🎬 ${video.name}` : "Upload Video File"}
          </Text>
        </TouchableOpacity>

    {/* Question Type */}
<View className="border border-gray-300 rounded-2xl bg-white mb-5">
  <Picker
    selectedValue={questionType || "placeholder"}
    onValueChange={(val) => {
      if (val !== "placeholder") setQuestionType(val);
    }}
    dropdownIconColor="#3590FF"
  >
    <Picker.Item
      label="Select Question Type"
      value="placeholder"
      color="#9CA3AF"
      enabled={false}
    />
    {questionTypeOptions.map((item) => (
      <Picker.Item key={item.value} label={item.label} value={item.value} />
    ))}
  </Picker>
</View>

{/* Question Count */}
<View className="border border-gray-300 rounded-2xl bg-white mb-5">
  <Picker
    selectedValue={questionCount || "placeholder"}
    onValueChange={(val) => {
      if (val !== "placeholder") setQuestionCount(val);
    }}
    dropdownIconColor="#3590FF"
  >
    <Picker.Item
      label="Select Question Count"
      value="placeholder"
      color="#9CA3AF"
      enabled={false}
    />
    {questionCountOptions.map((count) => (
      <Picker.Item key={count} label={`${count}`} value={count} />
    ))}
  </Picker>
</View>

{/* Difficulty */}
<View className="border border-gray-300 rounded-2xl bg-white mb-5">
  <Picker
    selectedValue={difficulty || "placeholder"}
    onValueChange={(val) => {
      if (val !== "placeholder") setDifficulty(val);
    }}
    dropdownIconColor="#3590FF"
  >
    <Picker.Item
      label="Select Difficulty"
      value="placeholder"
      color="#9CA3AF"
      enabled={false}
    />
    {difficultyOptions.map((item) => (
      <Picker.Item key={item.value} label={item.label} value={item.value} />
    ))}
  </Picker>
</View>


        {/* Schedule Time */}
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="border border-gray-300 rounded-2xl bg-white p-5 mb-5"
        >
          <Text className="text-gray-600 text-base">
            {scheduledTime
              ? scheduledTime.toLocaleString()
              : "Select Scheduled Time"}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={scheduledTime}
            mode="datetime"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setScheduledTime(selectedDate);
            }}
          />
        )}

        {/* Schedule Button */}
    <TouchableOpacity
           onPress={handleSchedule}
           className="bg-blue-500 py-4 rounded-full"
         >
           <Text className="text-white text-center font-bold text-lg">
             Schedule Now
           </Text>
         </TouchableOpacity>
   
      </View>
    </ScrollView>
  );
};

export default ScheduleVideo;
