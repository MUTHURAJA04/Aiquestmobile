import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
  Linking,
} from "react-native";
import { pick, types, errorCodes, isErrorWithCode } from '@react-native-documents/picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSummaryNote } from "../../services/apiClient";

const inputTypes = [
  { label: "Text", value: "text" },
  { label: "URL", value: "url" },
  { label: "Image", value: "image" },
  { label: "PDF", value: "pdf" },
  { label: "Word", value: "word" },
  { label: "Excel", value: "excel" },
  { label: "PowerPoint", value: "ppt" },
  { label: "Audio", value: "audio" },
  { label: "Video", value: "video" },
];

const fileTypeMap = {
  image: [types.images],
  pdf: [types.pdf],
  word: [types.doc, types.docx],
  excel: [types.xls, types.xlsx],
  ppt: [types.ppt, types.pptx],
  audio: [types.audio],
  video: [types.video],
};

const SummaryGenerate = ({ navigation }) => {
  const [form, setForm] = useState({ type: "", input: "", file: null });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [hasStoragePermission, setHasStoragePermission] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const userStr = await AsyncStorage.getItem("user");
      if (userStr) setUser(JSON.parse(userStr));
      await checkStoragePermission();
    };
    loadUser();
  }, []);

  const checkStoragePermission = async () => {
    if (Platform.OS !== "android") {
      setHasStoragePermission(true);
      return true;
    }

    try {
      let granted = false;

      if (Platform.Version >= 33) {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        ];

        const results = await PermissionsAndroid.requestMultiple(permissions);

        granted = Object.values(results).every(
          result => result === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: "Storage Permission Required",
            message: "This app needs access to your storage to pick files",
            buttonPositive: "OK",
            buttonNegative: "Cancel"
          }
        ) === PermissionsAndroid.RESULTS.GRANTED;
      }

      setHasStoragePermission(granted);
      return granted;
    } catch (err) {
      setHasStoragePermission(false);
      return false;
    }
  };

  const openAppSettings = () => {
    Linking.openSettings().catch(() => {
      Alert.alert("Error", "Cannot open settings");
    });
  };


  const handleFilePick = async () => {
    const hasPermission = await checkStoragePermission();
    if (!hasPermission) {
      Alert.alert(
        "Permission Required",
        "Storage permission is required to pick files. Please grant permission in settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: openAppSettings }
        ]
      );
      return;
    }

    try {
      const res = await pick({
        type: fileTypeMap[form.type] || [types.allFiles],
        copyTo: Platform.OS === "ios" ? "cachesDirectory" : undefined,
        allowMultiSelection: false,
      });

      if (res && res[0]) {
        const file = res[0];

        if (!file.hasRequestedType) {
          Alert.alert("Invalid File", "The selected file does not match the requested type.");
          return;
        }

        const uri = Platform.OS === "ios" ? file.fileCopyUri : file.uri;

        setForm({
          ...form,
          input: file.name,
          file: { uri, type: file.type || "application/octet-stream", name: file.name, size: file.size },
        });
      }

    } catch (err) {
      if (isErrorWithCode(err)) {
        switch (err.code) {
          case errorCodes.IN_PROGRESS:
       
            break;
          case errorCodes.UNABLE_TO_OPEN_FILE_TYPE:
            Alert.alert("Error", "Unable to open this file type on this device.");
            break;
          case errorCodes.OPERATION_CANCELED:
            
            break;
          default:
         
            Alert.alert("Error", err.message || "Unknown error occurred");
        }
      } else {
     
        Alert.alert("Error", "Unexpected error occurred");
      }
    }
  };


  const handleSubmit = async () => {
    if (!form.type) return Alert.alert("Error", "Select input type");
    if (!form.input) return Alert.alert("Error", "Input is required");
    if (!user?.userId || !user?.token)
      return Alert.alert("Error", "Login required");

    setLoading(true);
    try {
      const isFileType = ["image", "pdf", "word", "excel", "ppt", "audio", "video"].includes(form.type);
      const payload = {
        type: form.type,
        language: "en",
        ...(isFileType ? { file: form.file } : { input: form.input.trim() }),
      };

      const response = await createSummaryNote(payload);

      navigation.navigate("SummaryNoteView", {
        summary: response.summary?.split("\n") || [],
        title: response.title || "Generated Summary",
        remaining_credits: response.remaining_credits,
      });
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 p-6">
      <Text className="text-2xl font-bold text-center text-blue-600 mb-6">
        📝 Generate Summary
      </Text>

      <Text className="font-semibold text-lg mb-2">Select Input Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        {inputTypes.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setForm({ type: opt.value, input: "", file: null })}
            className={`p-3 rounded-xl mr-2 ${form.type === opt.value
                ? "bg-blue-100 border-2 border-blue-500"
                : "bg-gray-100 border border-gray-200"
              }`}
          >
            <Text className={form.type === opt.value ? "text-blue-600 font-bold" : "text-gray-700"}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {form.type && (
        <View>
          <Text className="font-semibold text-lg mt-6 mb-2">
            {["image", "pdf", "word", "excel", "ppt", "audio", "video"].includes(form.type)
              ? `Upload ${form.type.toUpperCase()}`
              : form.type === "text"
                ? "Enter Text"
                : "Enter URL"}
          </Text>

          {["image", "pdf", "word", "excel", "ppt", "audio", "video"].includes(form.type) ? (
            <>
              <TouchableOpacity
                onPress={handleFilePick}
                className="bg-gray-200 p-4 rounded-xl mb-2 border border-gray-300"
              >
                <Text className={form.input ? "text-black" : "text-gray-500"}>
                  {form.input || "Choose File"}
                </Text>
              </TouchableOpacity>
              {form.type === "image" && form.file?.uri && (
                <Image
                  source={{ uri: form.file.uri }}
                  className="w-full h-48 mt-4 rounded-xl"
                  resizeMode="contain"
                />
              )}
            </>
          ) : (
            <TextInput
              className="border border-gray-300 rounded-xl p-4 bg-gray-50 text-black"
              placeholder={form.type === "text" ? "Enter text..." : "Paste URL here..."}
              value={form.input}
              onChangeText={(val) => setForm({ ...form, input: val })}
              multiline={form.type === "text"}
              numberOfLines={form.type === "text" ? 6 : 1}
            />
          )}
        </View>
      )}

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        className={`mt-8 py-4 rounded-full ${loading ? "bg-gray-400" : "bg-blue-600"}`}
      >
        <Text className="text-center text-white font-bold text-lg">
          {loading ? "Generating..." : "Generate Summary"}
        </Text>
      </TouchableOpacity>

      {loading && (
        <View className="mt-4 items-center">
          <ActivityIndicator size="large" color="#3590ff" />
          <Text className="mt-2 text-gray-600">Generating summary...</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default SummaryGenerate;
