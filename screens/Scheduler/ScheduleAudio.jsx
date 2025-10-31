import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { pick, types } from "@react-native-documents/picker";
import { createQuizShedule } from "../../services/apiClient";

const ScheduleAudio = ({ navigation }) => {
  const [audio, setAudio] = useState(null);
  const [questionType, setQuestionType] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(null);
  const [loading, setLoading] = useState(false);

  // Dropdown options
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

  // 🎵 Pick Audio
  const pickAudio = async () => {
    try {
      const result = await pick({ type: [types.audio] });
      if (result && result[0]) {
        setAudio(result[0]);
      }
    } catch (err) {
      Alert.alert("Oops!", "Unable to select audio file.");
    }
  };

  // ✅ Validation
  const validateForm = () => {
    if (!audio) return Alert.alert("Oops!", "Please upload an audio file.");
    if (!questionType) return Alert.alert("Oops!", "Select question type.");
    if (!questionCount)
      return Alert.alert("Oops!", "Select number of questions.");
    if (!difficulty) return Alert.alert("Oops!", "Select difficulty level.");
    if (!scheduledTime)
      return Alert.alert("Oops!", "Choose a schedule date & time.");
    return true;
  };

  // 📅 Schedule Quiz
  const handleSchedule = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const formData = {
        audio,
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
        navigation.navigate("Waiting", { schedule: res, quiz: formData });
      } else {
        Alert.alert("Oops!", res?.message || "Failed to schedule quiz.");
      }
    } catch (err) {
      console.log("Error scheduling:", err);
      Alert.alert("Oops!", "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🕒 Date + Time Picker Combined Flow
  const openDatePicker = () => setShowDatePicker(true);

  const handleDateChange = (event, selectedDate) => {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }
    if (selectedDate) {
      setTempDate(selectedDate);
      setShowDatePicker(false);
      // Open time picker next
      setTimeout(() => setShowTimePicker(true), 200);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (event.type === "dismissed") {
      setShowTimePicker(false);
      return;
    }
    if (selectedTime) {
      const combinedDate = new Date(tempDate || scheduledTime);
      combinedDate.setHours(selectedTime.getHours());
      combinedDate.setMinutes(selectedTime.getMinutes());
      setScheduledTime(combinedDate);
    }
    setShowTimePicker(false);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-3 text-blue-600 font-semibold">
          Scheduling your quiz...
        </Text>
      </View>
    );
  }

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
          Schedule From Audio
        </Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Body */}
      <View className="px-6 mt-8">
        {/* Upload Audio */}
        <TouchableOpacity
          onPress={pickAudio}
          activeOpacity={0.8}
          className="border border-gray-300 rounded-2xl bg-white p-5 mb-5"
        >
          <Text className="text-gray-600 text-sm text-center">
            {audio ? `🎧 ${audio.name}` : "Upload Audio File"}
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
              <Picker.Item
                key={item.value}
                label={item.label}
                value={item.value}
              />
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
              <Picker.Item
                key={item.value}
                label={item.label}
                value={item.value}
              />
            ))}
          </Picker>
        </View>

        {/* Schedule Date & Time */}
        <TouchableOpacity
          onPress={openDatePicker}
          className="border border-gray-300 rounded-2xl bg-white p-5 mb-5"
        >
          <Text className="text-gray-600 text-base">
            {scheduledTime
              ? scheduledTime.toLocaleString([], {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "Select Schedule Date & Time"}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={scheduledTime}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={tempDate || scheduledTime}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleTimeChange}
          />
        )}

        {/* Submit Button */}
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

export default ScheduleAudio;
