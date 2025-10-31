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
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/Ionicons";
import { pick, types } from "@react-native-documents/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createQuizShedule } from "../../services/apiClient"; // your existing API call

const ScheduleWord = ({ navigation }) => {
  const [wordFile, setWordFile] = useState(null);
  const [questionType, setQuestionType] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  // File picker
  const pickWordFile = async () => {
    try {
      const res = await pick({
        type: [
          types.plainText,
          types.doc,
          types.docx,
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      });
      if (res && res.length > 0) {
        setWordFile(res[0]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to select file.");
    }
  };

  // Validation
  const validateForm = () => {
    if (!wordFile) return Alert.alert("Error", "Please upload a Word file.");
    if (!questionType) return Alert.alert("Error", "Please select question type.");
    if (!questionCount) return Alert.alert("Error", "Please select question count.");
    if (!difficulty) return Alert.alert("Error", "Please select difficulty.");
    if (!scheduledTime) return Alert.alert("Error", "Please select schedule time.");
    return true;
  };

  // Handle scheduling
  const handleSchedule = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const formData = {
        word: wordFile,
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
        Alert.alert("Error", res?.message || "Failed to schedule quiz.");
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      className="bg-gray-100"
    >
      <View className="flex-1 items-center justify-center px-5 py-8">
        {/* Back button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute left-4 top-4 p-2"
        >
          <Icon name="arrow-back" size={26} color="#555" />
        </TouchableOpacity>

        {/* Title */}
        <Text className="text-3xl font-extrabold text-blue-500 mt-12 mb-6 text-center">
          Schedule From Word File
        </Text>

        {/* Upload Word File */}
        <TouchableOpacity
          onPress={pickWordFile}
          className="w-full p-4 border border-gray-300 rounded-xl bg-white mb-5"
        >
          <Text className="text-gray-700 text-base">
            {wordFile ? `📄 ${wordFile.name}` : "Select Word File"}
          </Text>
        </TouchableOpacity>

        {/* Question Type */}
        <View className="border border-gray-300 rounded-2xl bg-white mb-5 w-full">
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
        <View className="border border-gray-300 rounded-2xl bg-white mb-5 w-full">
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
        <View className="border border-gray-300 rounded-2xl bg-white mb-5 w-full">
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
          className="w-full p-4 border border-gray-300 rounded-xl bg-white mb-5"
        >
          <Text className="text-gray-700 text-base">
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

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSchedule}
          activeOpacity={0.9}
          disabled={loading}
          className="w-full mt-4"
        >
          <LinearGradient
            colors={["#3590FF", "#BBFBFF"]}
            className="p-4 rounded-full items-center justify-center"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-extrabold text-lg">
                Schedule Quiz
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ScheduleWord;
