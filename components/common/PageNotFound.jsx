import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient"; // ✅ For RN CLI
import { SafeAreaView } from "react-native-safe-area-context";

const PageNotFound = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient
        colors={["#60A5FA", "#9333EA"]}
        className="flex-1 items-center justify-center px-6"
      >
        <Image
          source={{
            uri: "https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif",
          }}
          className="w-64 h-64 mb-6"
          resizeMode="contain"
        />

        <Text className="text-white text-3xl font-extrabold mb-2">
          404 - Page Not Found
        </Text>

        <Text className="text-white text-center text-base opacity-90 mb-6">
          Oops! The page you’re looking for doesn’t exist or failed to load.
        </Text>

        <TouchableOpacity
          onPress={() => navigation.replace("Home")}
          activeOpacity={0.8}
          className="bg-white px-6 py-3 rounded-full shadow-lg"
        >
          <Text className="text-blue-600 font-bold text-lg">
            Go Back Home
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default PageNotFound;
