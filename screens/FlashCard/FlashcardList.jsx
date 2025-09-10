import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Flashcard from "./Flashcard";

const FlashcardList = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { flashcards = [], flashcardText = "" } = route.params || {};

  const [showExitModal, setShowExitModal] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Warn before leaving if not submitted
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (isSubmitted) return;
      e.preventDefault();
      setShowExitModal(true);
    });
    return unsubscribe;
  }, [navigation, isSubmitted]);

  // Trigger Alert from effect
  useEffect(() => {
    if (!showExitModal) return;
    
    Alert.alert(
      "Exit",
      "Are you sure you want to exit?",
      [
        { 
          text: "Cancel", 
          style: "cancel", 
          onPress: () => setShowExitModal(false) 
        },
        { 
          text: "Exit", 
          onPress: () => navigation.navigate("CardInput") 
        },
      ],
      { cancelable: true }
    );
  }, [showExitModal, navigation]);

  const handleBackClick = () => {
    if (!isSubmitted) {
      setShowExitModal(true);
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={handleBackClick}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={18} color="#000" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>
        Flashcards{flashcardText ? `: ${flashcardText}` : ""}
      </Text>

      {/* List */}
      {!flashcards.length ? (
        <Text style={styles.errorText}>No flashcards available</Text>
      ) : (
        <FlatList
          data={flashcards}
          keyExtractor={(_, index) => String(index)}
          renderItem={({ item }) => (
            <Flashcard
              question={item.term || item.question || "No question"}
              answer={item.definition || item.answer || "No answer"}
            />
          )}
          numColumns={1}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 16,
    position: "relative",
    backgroundColor: "#F9FAFB"
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  backText: {
    color: "#000",
    fontSize: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 64,
    marginBottom: 24,
    color: "#3B82F6",
  },
  errorText: {
    textAlign: "center",
    color: "#EF4444",
    fontWeight: "500",
    marginTop: 40,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 80,
  },
});

export default FlashcardList;