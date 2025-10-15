import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";

const Flashcard = ({ question, answer }) => {
  const [flipped, setFlipped] = useState(false);
  const rotate = useSharedValue(0);
  const { t } = useTranslation();

  const toggleFlip = () => {
    setFlipped(!flipped);
    rotate.value = withTiming(flipped ? 0 : 180, { duration: 600 });
  };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotate.value}deg` }],
    backfaceVisibility: "hidden",
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${rotate.value + 180}deg` }],
    backfaceVisibility: "hidden",
  }));

  return (
    <Pressable
  onPress={toggleFlip}
  className="w-72 h-64 mx-auto my-4"
  style={{ perspective: 1000 }}
>
  {/* Front */}
  <Animated.View
    style={frontStyle}
    className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg"
  >
    <Text className="text-lg font-bold text-black  text-center px-4">
      {question}
    </Text>
    <Text className="mt-3 text-sm text-black  ">{t("flashflip.tap_to_reveal")}</Text>
  </Animated.View>

  {/* Back */}
  <Animated.View
    style={backStyle}
    className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg"
  >
    <Text className="text-lg font-bold text-black   text-center px-4">
      {answer}
    </Text>
    <Text className="mt-3 text-sm text-black  ">{t("flashflip.tap_to_back")}</Text>
  </Animated.View>
</Pressable>

  );
};

export default Flashcard;
