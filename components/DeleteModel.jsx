// components/DeleteModal.jsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

import CustomModal from "./CustomModal";
import { deleteUserAccount, getDeleteReasons } from "../services/apiClient";

const DeleteModal = ({ visible, onClose, userId, token, onDeleted }) => {
  const [reasons, setReasons] = useState([]);
  const [selectedReason, setSelectedReason] = useState(null);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingReasons, setLoadingReasons] = useState(false);
  const navigation = useNavigation();

  // 🔹 Fetch delete reasons when modal opens
  useEffect(() => {
    if (visible) fetchReasons();
  }, [visible]);

  const fetchReasons = async () => {
    try {
      setLoadingReasons(true);
      const data = await getDeleteReasons();
      if (data?.status === 1 && Array.isArray(data.reasons)) {
        setReasons(data.reasons);
      } else {
        Alert.alert("Error", "Failed to load delete reasons.");
      }
    } catch (error) {
      Alert.alert("Error", "Unable to fetch reasons.");
    } finally {
      setLoadingReasons(false);
    }
  };

  // 🔹 Handle delete account
  const handleDelete = async () => {
    if (!selectedReason) {
      Alert.alert("Error", "Please select a reason.");
      return;
    }

    const selected = reasons.find((r) => r.id === selectedReason);
    if (selected?.requires_comment && !comments.trim()) {
      Alert.alert("Error", "Please provide a comment for this reason.");
      return;
    }

    setLoading(true);
    try {
      const response = await deleteUserAccount({
        userId,
        token,
        reason_id: selectedReason,
        comments: comments.trim() || undefined,
      });

      if (response?.status === 1) {
        Alert.alert("Success", "Your account has been deleted successfully.", [
          {
            text: "OK",
            onPress: async () => {
              try {
                // 🔹 Clear user session
                await AsyncStorage.removeItem("user");
                setComments("");
                setSelectedReason(null);
                onDeleted && onDeleted();
                onClose();

                // 🔹 Navigate to Home after deletion
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Home" }],
                });
              } catch (err) {
                console.error("Logout after deletion failed:", err);
              }
            },
          },
        ]);
      } else {
        Alert.alert("Error", response?.message || "Failed to delete account.");
      }
    } catch (err) {
      Alert.alert("Error", err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomModal visible={visible} onClose={onClose} title="Delete Account">
      {loadingReasons ? (
        <ActivityIndicator size="large" color="#EF4444" />
      ) : (
        <ScrollView className="max-h-96">
          <Text className="text-gray-700 mb-4">
            Are you sure you want to delete your account? This action is irreversible.
          </Text>

          {/* 🔹 Reason List */}
          <Text className="font-semibold text-gray-800 mb-2">Select a reason</Text>
          {reasons.map((r) => (
            <TouchableOpacity
              key={r.id}
              onPress={() => setSelectedReason(r.id)}
              className={`p-3 rounded-xl mb-2 border ${
                selectedReason === r.id
                  ? "border-red-600 bg-red-50"
                  : "border-gray-300"
              }`}
            >
              <Text className="text-gray-800">{r.text}</Text>
            </TouchableOpacity>
          ))}

          {/* 🔹 Optional Comment Box */}
          {reasons.find((r) => r.id === selectedReason)?.requires_comment && (
            <>
              <Text className="font-semibold text-gray-800 mb-2 mt-3">
                Please provide comments
              </Text>
              <TextInput
                placeholder="Write your reason..."
                placeholderTextColor="#9CA3AF"
                value={comments}
                onChangeText={setComments}
                multiline
                className="border border-gray-300 rounded-xl p-3 mb-4 text-black"
              />
            </>
          )}

          {/* 🔹 Delete Button */}
          {loading ? (
            <ActivityIndicator size="small" color="#EF4444" className="mb-3" />
          ) : (
            <TouchableOpacity
              onPress={handleDelete}
              className="bg-red-600 py-3 rounded-xl mb-2"
            >
              <Text className="text-white font-semibold text-center">
                Delete Account
              </Text>
            </TouchableOpacity>
          )}

          {/* 🔹 Cancel Button */}
          <TouchableOpacity
            onPress={() => {
              setComments("");
              setSelectedReason(null);
              onClose();
            }}
            className="py-3 rounded-xl border border-gray-300"
          >
            <Text className="text-center text-gray-700 font-semibold">
              Cancel
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </CustomModal>
  );
};

export default DeleteModal;
