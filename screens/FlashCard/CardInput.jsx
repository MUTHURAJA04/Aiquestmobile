
import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateFlashcards, getTopicSuggestions } from "../../services/apiClient";

const CardInput = () => {
  const [topic, setTopic] = useState("");
  const [error, setError] = useState("");
  const [cardCount, setCardCount] = useState(10);
  const [language] = useState("en");
  const [credits, setCredits] = useState(20);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const navigation = useNavigation();

  useEffect(() => {
    const loadCredits = async () => {
      try {
        const savedCredits = await AsyncStorage.getItem('userCredits');
        if (savedCredits) {
          setCredits(parseInt(savedCredits));
        }
      } catch (error) {
        console.error('Error loading credits:', error);
      }
    };

    loadCredits();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(topic), 400);
    return () => clearTimeout(t);
  }, [topic]);

  useEffect(() => {
    const run = async () => {
      if (!debouncedQuery.trim()) return setSuggestions([]);
      try {
        const res = await getTopicSuggestions(debouncedQuery);
        setSuggestions(res?.suggestions || []);
      } catch {
        setSuggestions([]);
      }
    };
    run();
  }, [debouncedQuery]);

  // --- 💡 MODIFIED FUNCTION ---
 const handleSubmit = async () => {
  if (credits <= 0) {
    setError("Please activate a pricing plan to generate flashcards");
    return;
  }

  if (!topic.trim()) {
    setError("Topic cannot be empty!");
    return;
  }

  try {
    setLoading(true);
    await AsyncStorage.setItem("flashcard_count", cardCount.toString());

    const data = await generateFlashcards(topic, language);

    if (data?.error) {
      setError(data.error);
      return;
    }

    const cards = data?.flashcards || [];

    const newCredits = credits - 1;
    setCredits(newCredits);
    await AsyncStorage.setItem("userCredits", newCredits.toString());

    setError("");
    navigation.navigate("Flashcard", { 
      flashcards: cards, 
      flashcardText: topic 
    });
  } catch (err) {
    console.error("Flashcard generation error:", err);
    setError(err?.message || "Unexpected error occurred.");
  } finally {
    setLoading(false);
  }
};


  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#E0F7FA" }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, color: "#3B82F6", fontWeight: "600", fontSize: 18 }}>
          Generating flashcards...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <LinearGradient
        colors={["#D3E3FD", "#BBFBFF"]}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ position: "absolute", top: 48, left: 16, flexDirection: "row", alignItems: "center", gap: 8 }}
        >
          <Ionicons name="arrow-back" size={20} color="#000" />
          <Text style={{ color: "#000", fontSize: 14 }}>Back</Text>
        </TouchableOpacity>

        <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 16, paddingTop: 112, paddingBottom: 48 }}>
          <View style={{ backgroundColor: "rgba(255, 255, 255, 0.8)", borderRadius: 24, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
            <Text style={{ fontSize: 28, fontWeight: "800", textAlign: "center", marginBottom: 16, color: "transparent", backgroundClip: "text", backgroundImage: "linear-gradient(to right, #3B82F6, #06B6D4)" }}>
              Flashcards
            </Text>
            <Text style={{ textAlign: "center", color: "#4B5563", marginBottom: 24 }}>
              Enter a topic to generate flashcards
            </Text>

            <View style={{ position: "relative", marginBottom: 24 }}>
              <TextInput
                style={{ borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 12, padding: 16, backgroundColor: "#F3F4F6", color: "#0C0C0C" }}
                placeholder="Enter a topic"
                value={topic}
                onChangeText={(text) => { setTopic(text); setError(""); }}
              />
              {suggestions.length > 0 && topic.trim() && (
                <View style={{ position: "absolute", top: 64, left: 0, right: 0, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 12, maxHeight: 192, zIndex: 10 }}>
                  <ScrollView keyboardShouldPersistTaps="handled">
                    {suggestions.map((s, i) => (
                      <TouchableOpacity
                        key={`${s}-${i}`}
                        onPress={() => { setTopic(s); setSuggestions([]); }}
                        style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#E5E7EB", flexDirection: "row", alignItems: "center", gap: 8 }}
                      >
                        <Ionicons name="search-outline" size={16} color="#06b6d4" />
                        <Text style={{ color: "#374151" }}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <Text style={{ textAlign: "center", color: "#4B5563", marginBottom: 12, fontWeight: "500" }}>Number of cards</Text>
            <View style={{ flexDirection: "row", justifyContent: "center", gap: 16, marginBottom: 24 }}>
              {[10, 15, 20 , 25].map((count) => (
                <TouchableOpacity
                  key={count}
                  onPress={() => setCardCount(count)}
                  style={{
                    paddingHorizontal: 20,
                    paddingVertical: 8,
                    borderRadius: 12,
                    backgroundColor: cardCount === count ? "#3B82F6" : "#E5E7EB"
                  }}
                >
                  <Text style={{ color: cardCount === count ? "#FFF" : "#374151" }}>{count}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {error ? (
              <View style={{ backgroundColor: "#FEE2E2", padding: 12, borderRadius: 8, marginBottom: 16 }}>
                <Text style={{ color: "#DC2626", textAlign: "center" }}>{error}</Text>
                {credits <= 0 && (
                  <TouchableOpacity onPress={() => navigation.navigate("Pricing")}>
                    <Text style={{ color: "#2563EB", textAlign: "center", textDecorationLine: "underline", marginTop: 8 }}>View Plans</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : null}

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={credits <= 0}
              style={{
                width: "100%",
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: credits > 0 ? "#3B82F6" : "#9CA3AF"
              }}
            >
              <Text style={{ color: "#FFF", textAlign: "center", fontWeight: "600" }}>Generate</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 16 }}>
              <Text style={{ color: "#4B5563", marginRight: 4 }}>Credits remaining:</Text>
              <Text style={{ color: credits > 5 ? "#10B981" : "#EF4444", fontWeight: "600" }}>{credits}</Text>
            </View>

            {credits <= 3 && (
              <Text style={{ color: "#DC2626", textAlign: "center", marginTop: 8 }}>Please activate a plan</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CardInput;
