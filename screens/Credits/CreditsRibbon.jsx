// components/CreditsRibbon.js
import React from "react";
import { TouchableOpacity, Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import FAIcon from "react-native-vector-icons/FontAwesome5";

const CreditsRibbon = ({ credits, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="relative flex-row items-center bg-gradient-to-r from-blue-500 to-cyan-300 px-4 py-2 rounded-full shadow-lg"
    >
      <View className="flex-row items-center">
  <FAIcon name="coins" size={22} color="#facc15" />
</View>
      <Text className="ml-2 font-semibold ">
        {credits ?.toLocaleString() || 0} Credits
      </Text>
    </TouchableOpacity>
  );
};

export default CreditsRibbon;
