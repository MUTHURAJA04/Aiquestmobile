// screens/SummaryNoteView.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Share,
  BackHandler,
  Modal,
} from "react-native";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import { PermissionsAndroid } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

// Request Android storage permission
const requestStoragePermission = async () => {
  if (Platform.OS === "android") {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: "Storage Permission",
          message: "App needs access to save PDF files",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error("Permission error:", err);
      return false;
    }
  }
  return true; // iOS does not require permission
};

const SummaryNoteView = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { summary = [] } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Back button handling for Android
  useEffect(() => {
    const backAction = () => {
      setShowExitModal(true);
      return true;
    };
    const handler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => handler.remove();
  }, []);

  const generateAndSharePDF = async () => {
    if (!summary || summary.length === 0) {
      Alert.alert("⚠️ No Data", "No summary available to generate PDF.");
      return;
    }

    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert(
        "Permission Denied",
        "Cannot save PDF without storage permission."
      );
      return;
    }

    try {
      setLoading(true);

      const pointsHtml = summary
        .map((p) => `<li>${p.replace(/^[-•\s]+/, "").trim()}</li>`)
        .join("");
      const date = new Date().toLocaleDateString();

      const options = {
        html: `
          <html>
            <head><meta charset="utf-8" />
              <style>
                body { font-family: Arial, sans-serif; padding: 16px; }
                h1 { color: #3590ff; text-align: center; }
                ul { margin-top: 12px; }
                li { font-size: 14px; line-height: 1.6; margin-bottom: 6px; }
                footer { margin-top: 20px; font-size: 12px; color: #777; text-align: center; }
              </style>
            </head>
            <body>
              <h1>📝 Summary Notes</h1>
              <p>Date: ${date}</p>
              <ul>${pointsHtml}</ul>
              <footer>Generated using DigiAiQuest</footer>
            </body>
          </html>
        `,
        fileName: `SummaryNote_${Date.now()}`,
        directory: Platform.OS === "ios" ? "Documents" : "Download",
        base64: false,
      };

      const file = await RNHTMLtoPDF.convert(options);

      Alert.alert("✅ PDF Generated", `Saved to: ${file.filePath}`, [
        {
          text: "Share",
          onPress: async () => {
            try {
              await Share.share({
                title: "Share Summary PDF",
                message: "Here is my summary PDF",
                url: Platform.OS === "android" ? `file://${file.filePath}` : file.filePath,
              });
            } catch (err) {
              console.warn("Share failed", err);
            }
          },
        },
        { text: "OK" },
      ]);
    } catch (err) {
      console.error("PDF generation failed:", err);
      Alert.alert("❌ Error", "Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-100 p-4">
      {/* Header */}
      <View className="flex-row justify-between items-center bg-white rounded-xl shadow p-4 mb-4">
        <Text className="text-lg font-bold text-gray-800">📝 Summary Notes</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text className="text-blue-600 font-semibold">Back</Text>
        </TouchableOpacity>
      </View>

      {/* Summary List */}
      <View className="bg-white rounded-2xl shadow-xl p-6 flex-1 mb-4">
        {summary.length > 0 ? (
          <FlatList
            data={summary}
            keyExtractor={(_, i) => i.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Text className="text-gray-800 text-base leading-6 mb-3">
                {"\u2022 "} {item.replace(/^[-•\s]+/, "").trim()}
              </Text>
            )}
          />
        ) : (
          <Text className="text-gray-500 text-center">No summary data available</Text>
        )}
      </View>

      {/* Download & Share Button */}
      {/* {summary.length > 0 && (
        <TouchableOpacity
          onPress={generateAndSharePDF}
          disabled={loading}
          className={`mt-4 bg-blue-600 rounded-xl py-3 ${loading ? "opacity-50" : ""}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-center text-white font-semibold text-lg">
              Download & Share PDF
            </Text>
          )}
        </TouchableOpacity>
      )} */}

      {/* Exit Confirmation Modal */}
      <Modal transparent visible={showExitModal} animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center p-5">
          <View className="bg-white rounded-2xl p-6 w-full max-w-md">
            <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Do you really want to exit?
            </Text>
            <View className="flex-row justify-center space-x-6">
              <TouchableOpacity
                onPress={() => setShowExitModal(false)}
                className="px-6 py-2 rounded-lg bg-gray-200"
              >
                <Text className="text-gray-800 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowExitModal(false);
                  navigation.goBack();
                }}
                className="px-6 py-2 rounded-lg bg-red-500"
              >
                <Text className="text-white font-semibold">Exit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SummaryNoteView;
