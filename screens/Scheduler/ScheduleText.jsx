import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { createQuizShedule } from "../../services/scheduler";
import { useAuth } from "../../components/navigations/AuthContext";
import { useAppContext } from "../../components/context/AppContext";
import DateTimePicker from "@react-native-community/datetimepicker";

const ScheduleText = () => {
  const navigation = useNavigation();
  const { selectedPlan, credits, setCredits, language } = useAppContext();
  const { user } = useAuth();

  const [text, setText] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(null);

  const isTrial = selectedPlan?.title === "TRIAL";

  const questionTypeOptions = [
    { label: "True / False", value: "true_false" },
    { label: "Multiple Choice", value: "mcq" },
    { label: "Both", value: "both" },
  ];

  const questionCountOptions = isTrial
    ? [{ label: "5", value: 5 }]
    : [
        { label: "5", value: 5 },
        { label: "10", value: 10 },
        { label: "15", value: 15 },
        { label: "20", value: 20 },
        { label: "25", value: 25 },
      ];

  const difficultyOptions = [
    { label: "Easy", value: "easy" },
    { label: "Medium", value: "medium" },
    { label: "Hard", value: "hard" },
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!text.trim()) newErrors.text = "Enter your quiz text";
    if (!questionType) newErrors.questionType = "Select a question type";
    if (!questionCount) newErrors.questionCount = "Select number of questions";
    if (!difficulty) newErrors.difficulty = "Select difficulty level";

    const now = new Date();
    if (!scheduledTime || scheduledTime - now < 60000) {
      newErrors.scheduledTime = "Schedule at least 1 minute later";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSchedule = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please log in to continue.");
      navigation.navigate("Login");
      return;
    }

    if (credits <= 0 && !isTrial) {
      Alert.alert("No Credits", "Please upgrade your plan to continue.");
      navigation.navigate("Pricing");
      return;
    }

    if (!validateForm()) return;

    try {
      setLoading(true);

      const formData = {
        text,
        question_type: questionType,
        number_question: questionCount,
        difficulty,
        scheduled_time: scheduledTime.toISOString(),
        language: language || "en",
      };

      const res = await createQuizShedule(formData);

      if (res?.status === "success") {
        Alert.alert("✅ Success", "Quiz scheduled successfully!");
        if (!isTrial) {
          setCredits((prev) => prev - 1);
        }
        navigation.navigate("Waiting", { schedule: res, quiz: formData });
      } else {
        Alert.alert("⚠️ Failed", res?.message || "Please try again");
      }
    } catch (err) {
      console.error("Schedule error:", err);
      Alert.alert("❌ Error", "Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3590FF" />
        <Text className="text-gray-500 mt-3">Scheduling your AI quiz...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#F8FAFF", "#E9F0FF"]} className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="flex-row items-center mb-6 mt-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-3 p-2 rounded-full bg-blue-100"
          >
            <MaterialIcons name="arrow-back" size={24} color="#3590FF" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">
            AI Text Quiz Scheduler
          </Text>
        </View>

        {/* Text Input */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">Enter Text</Text>
          <TextInput
            value={text}
            onChangeText={(val) => {
              setText(val);
              setErrors((prev) => ({ ...prev, text: "" }));
            }}
            placeholder="Type or paste your text here..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            style={{
              borderWidth: 1,
              borderColor: "#D1D5DB",
              backgroundColor: "#FFFFFF",
              borderRadius: 12,
              padding: 14,
              color: "#111827",
              textAlignVertical: "top",
              fontSize: 15,
            }}
          />
          {errors.text && (
            <Text className="text-red-500 text-xs mt-1">{errors.text}</Text>
          )}
        </View>

        {/* Question Type */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">Question Type</Text>
          <View className="border border-gray-300 rounded-xl bg-white">
            <Picker
              selectedValue={questionType || "placeholder"}
              onValueChange={(val) => {
                if (val !== "placeholder") {
                  setQuestionType(val);
                  setErrors((prev) => ({ ...prev, questionType: "" }));
                }
              }}
              dropdownIconColor="#3590FF"
            >
              <Picker.Item
                label="Select question type..."
                value="placeholder"
                color="#9CA3AF"
              />
              {questionTypeOptions.map((opt) => (
                <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
              ))}
            </Picker>
          </View>
          {errors.questionType && (
            <Text className="text-red-500 text-xs mt-1">{errors.questionType}</Text>
          )}
        </View>

        {/* Question Count */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">Number of Questions</Text>
          <View className="border border-gray-300 rounded-xl bg-white">
            <Picker
              selectedValue={questionCount}
              onValueChange={(val) => {
                setQuestionCount(val);
                setErrors((prev) => ({ ...prev, questionCount: "" }));
              }}
              dropdownIconColor="#3590FF"
            >
              <Picker.Item
                label="Select question count..."
                value=""
                color="#9CA3AF"
              />
              {questionCountOptions.map((opt) => (
                <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
              ))}
            </Picker>
          </View>
          {errors.questionCount && (
            <Text className="text-red-500 text-xs mt-1">{errors.questionCount}</Text>
          )}
        </View>

        {/* Difficulty */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold mb-2">Difficulty</Text>
          <View className="border border-gray-300 rounded-xl bg-white">
            <Picker
              selectedValue={difficulty}
              onValueChange={(val) => {
                setDifficulty(val);
                setErrors((prev) => ({ ...prev, difficulty: "" }));
              }}
              dropdownIconColor="#3590FF"
            >
              <Picker.Item
                label="Select difficulty..."
                value=""
                color="#9CA3AF"
              />
              {difficultyOptions.map((opt) => (
                <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
              ))}
            </Picker>
          </View>
          {errors.difficulty && (
            <Text className="text-red-500 text-xs mt-1">{errors.difficulty}</Text>
          )}
        </View>

        {/* Schedule Time Picker */}
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="bg-white rounded-xl p-4 mb-3 border border-gray-300"
        >
          <Text className="text-gray-700">
            {scheduledTime
              ? scheduledTime.toLocaleString()
              : "Select Schedule Time"}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={scheduledTime}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              if (event.type === "dismissed") {
                setShowDatePicker(false);
                return;
              }
              if (selectedDate) {
                setShowDatePicker(false);
                setTimeout(() => setShowTimePicker(true), 200);
                setTempDate(selectedDate);
              }
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={tempDate || scheduledTime}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              if (event.type === "dismissed") {
                setShowTimePicker(false);
                return;
              }
              if (selectedTime) {
                const combined = new Date(tempDate || scheduledTime);
                combined.setHours(selectedTime.getHours());
                combined.setMinutes(selectedTime.getMinutes());
                setScheduledTime(combined);
              }
              setShowTimePicker(false);
            }}
          />
        )}

        {errors.scheduledTime && (
          <Text className="text-red-500 text-xs mb-2">
            {errors.scheduledTime}
          </Text>
        )}

        {/* Button */}
        <TouchableOpacity
          onPress={handleSchedule}
          activeOpacity={0.8}
          className="rounded-full overflow-hidden shadow-lg"
        >
          <LinearGradient
            colors={["#3590FF", "#56A9FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="py-4"
          >
            <Text className="text-center text-white text-lg font-semibold">
              Schedule Now
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {isTrial && (
          <Text className="text-center text-gray-500 text-sm mt-5">
            Trial plan: Only 5 questions allowed.
          </Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

export default ScheduleText;
