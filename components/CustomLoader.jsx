import React, { useEffect, useRef } from "react";
import { View, Animated, Platform } from "react-native";
import LinearGradient from "react-native-linear-gradient";

const CustomLoader = () => {
  const bounce1 = useRef(new Animated.Value(0)).current;
  const bounce2 = useRef(new Animated.Value(0)).current;
  const scale1 = useRef(new Animated.Value(1)).current;
  const scale2 = useRef(new Animated.Value(1)).current;

  const startBounce = (bounce, scale) => {
    return Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(bounce, {
            toValue: -10,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1.1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(bounce, {
            toValue: 10,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.95,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(bounce, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
  };

  useEffect(() => {
    startBounce(bounce1, scale1).start();
    setTimeout(() => {
      startBounce(bounce2, scale2).start();
    }, 400);
  }, []);

  return (
    <View className="flex-row space-x-3 items-center">
      {[{ bounce: bounce1, scale: scale1 }, { bounce: bounce2, scale: scale2 }].map(
        ({ bounce, scale }, i) => (
          <Animated.View
            key={i}
            style={{
              transform: [
                { translateY: bounce },
                { scale },
                { perspective: 500 },
                { rotateX: "25deg" },
                { rotateY: "-10deg" },
              ],
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4.65,
              elevation: Platform.OS === "android" ? 6 : 0,
            }}
          >
            <LinearGradient
              colors={["#a78bfa", "#3b82f6", "#6366f1"]}
              className="w-7 h-7 rounded-xl"
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>
        )
      )}
    </View>
  );
};

export default CustomLoader;
