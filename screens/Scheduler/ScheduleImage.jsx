import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  TextInput
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { launchImageLibrary } from "react-native-image-picker";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { createQuizShedule } from "../../services/apiClient";
import { useAppContext } from "../../components/context/AppContext";
import DateTimePicker from "@react-native-community/datetimepicker";

const ScheduleImage = () => {
  const navigation = useNavigation();
  const { credits, setCredits, selectedPlan, user } = useAppContext();

  const [imageUri, setImageUri] = useState(null);
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [scheduleDateTime, setScheduleDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(null);


  const questionCountOptions =
    selectedPlan?.plan_name?.toLowerCase() === "trial"
      ? [{ label: "5", value: 5 }]
      : [
        { label: "5", value: 5 },
        { label: "10", value: 10 },
        { label: "15", value: 15 },
        { label: "20", value: 20 },
      ];

  const difficultyOptions = [
    { label: "Easy", value: "easy" },
    { label: "Medium", value: "medium" },
    { label: "Hard", value: "hard" },
  ];

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: "photo",
      quality: 0.8,
    });

    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert("Error", "Failed to select image.");
      return;
    }

    const asset = result.assets?.[0];
    if (asset?.uri) {
      setImageUri(asset.uri);
      setErrors((prev) => ({ ...prev, imageUri: "" }));
    }
  };

  const validateInputs = () => {
    const newErrors = {};
    if (!imageUri) newErrors.imageUri = "Select an image";
    if (!topic.trim()) newErrors.topic = "Enter a topic";
    if (!questionCount) newErrors.questionCount = "Select question count";
    if (!difficulty) newErrors.difficulty = "Select difficulty";
    if (!scheduleDateTime) newErrors.scheduleDateTime = "Select schedule time";

    const now = new Date();
    if (scheduleDateTime && scheduleDateTime - now < 60000) {
      newErrors.scheduleDateTime = "Schedule at least 1 minute later";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSchedule = async () => {
    if (!validateInputs()) return;

    if (!user) {
      setTimeout(() => {
        Alert.alert("Login Required", "Please login before scheduling a quiz.");
      }, 300);
      return;
    }

    if (credits <= 0) {
      setTimeout(() => {
        Alert.alert("No Credits", "You don’t have enough credits to schedule this quiz.");
      }, 300);
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("user_id", user?.user_id);
      formData.append("topic", topic);
      formData.append("quiz_type", "image");
      formData.append("question_count", questionCount);
      formData.append("difficulty", difficulty);
      formData.append("schedule_datetime", scheduleDateTime.toISOString());
      formData.append("file", {
        uri: imageUri,
        name: "quiz_image.jpg",
        type: "image/jpeg",
      });

      const response = await createQuizShedule(formData);

      setLoading(false);

      if (response?.status === 1) {
        setCredits((prev) => prev - 1);
        setTimeout(() => {
          Alert.alert("✅ Success", "Image quiz scheduled successfully!", [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]);
        }, 300);
      } else {
        setTimeout(() => {
          Alert.alert("⚠️ Failed", response?.message || "Please try again.");
        }, 300);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      setTimeout(() => {
        Alert.alert("❌ Error", "Something went wrong.");
      }, 300);
    }
  };


  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3590FF" />
        <Text className="text-gray-500 mt-3">Scheduling your quiz...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#F8FAFF", "#E9F0FF"]} className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View className="flex-row items-center mb-6 mt-2">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-3 p-2 rounded-full bg-blue-100"
          >
            <MaterialIcons name="arrow-back" size={22} color="#3590FF" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-800">
            Schedule Image Quiz
          </Text>
        </View>

        {/* Image Picker */}
        <TouchableOpacity
          onPress={pickImage}
          activeOpacity={0.9}
          className="border border-dashed border-blue-400 rounded-2xl p-4 items-center justify-center bg-white mb-5"
        >
          {imageUri ? (
            <>
              <Image
                source={{ uri: imageUri }}
                className="w-full h-52 rounded-xl mb-3"
                resizeMode="cover"
              />
              <Text className="text-blue-500 font-semibold">Change Image</Text>
            </>
          ) : (
            <Text className="text-gray-500">📷 Tap to upload an image</Text>
          )}
        </TouchableOpacity>
        {errors.imageUri && (
          <Text className="text-red-500 text-xs mb-2">{errors.imageUri}</Text>
        )}

        {/* Topic */}
        <View className="bg-white rounded-xl p-3 mb-3 border border-gray-300">
          <Text className="text-gray-800 mb-1">Quiz Topic</Text>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => { }}
            className="border-b border-gray-200"
          >
            <TextInput
              placeholder="Enter quiz topic"
              value={topic}
              onChangeText={(val) => {
                setTopic(val);
                setErrors((prev) => ({ ...prev, topic: "" }));
              }}
              className="text-base text-gray-700"
              placeholderTextColor="#9CA3AF"
            />
          </TouchableOpacity>
        </View>
        {errors.topic && (
          <Text className="text-red-500 text-xs mb-2">{errors.topic}</Text>
        )}

        {/* Question Count */}
        <View className="border border-gray-300 rounded-xl bg-white mb-3">
          <Picker
            selectedValue={questionCount}
            onValueChange={(val) => {
              setQuestionCount(val);
              setErrors((prev) => ({ ...prev, questionCount: "" }));
            }}
            dropdownIconColor="#3590FF"
          >
            <Picker.Item
              label="Select number of questions..."
              value=""
              color="#9CA3AF"
            />
            {questionCountOptions.map((opt) => (
              <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
            ))}
          </Picker>
        </View>
        {errors.questionCount && (
          <Text className="text-red-500 text-xs mb-2">
            {errors.questionCount}
          </Text>
        )}

        {/* Difficulty */}
        <View className="border border-gray-300 rounded-xl bg-white mb-3">
          <Picker
            selectedValue={difficulty}
            onValueChange={(val) => {
              setDifficulty(val);
              setErrors((prev) => ({ ...prev, difficulty: "" }));
            }}
            dropdownIconColor="#3590FF"
          >
            <Picker.Item
              label="Select difficulty level..."
              value=""
              color="#9CA3AF"
            />
            {difficultyOptions.map((opt) => (
              <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
            ))}
          </Picker>
        </View>
        {errors.difficulty && (
          <Text className="text-red-500 text-xs mb-2">{errors.difficulty}</Text>
        )}


        {/* Schedule Time */}
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="bg-white rounded-xl p-4 mb-3 border border-gray-300"
        >
          <Text className="text-gray-700">
            {scheduleDateTime
              ? scheduleDateTime.toLocaleString()
              : "Select Schedule Time"}
          </Text>
        </TouchableOpacity>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={scheduleDateTime}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              if (event.type === "dismissed") {
                setShowDatePicker(false);
                return;
              }

              if (selectedDate) {
                setShowDatePicker(false);
                // open time picker next
                setTimeout(() => setShowTimePicker(true), 200);
                setTempDate(selectedDate); // store temp date
              }
            }}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={tempDate || scheduleDateTime}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              if (event.type === "dismissed") {
                setShowTimePicker(false);
                return;
              }

              if (selectedTime) {
                const combinedDate = new Date(tempDate || scheduleDateTime);
                combinedDate.setHours(selectedTime.getHours());
                combinedDate.setMinutes(selectedTime.getMinutes());
                setScheduleDateTime(combinedDate);
              }
              setShowTimePicker(false);
            }}
          />
        )}




        {errors.scheduleDateTime && (
          <Text className="text-red-500 text-xs mb-2">
            {errors.scheduleDateTime}
          </Text>
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

        {selectedPlan?.plan_name?.toLowerCase() === "trial" && (
          <Text className="text-center text-gray-500 text-sm mt-5">
            Trial plan: Only 5 questions allowed.
          </Text>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

export default ScheduleImage;
