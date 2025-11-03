import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import RazorpayCheckout from "react-native-razorpay";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Razorpay from "../../components/common/Rezerpay";
import { createOrder, getPlans, verifyPayment } from "../../services/apiClient";

const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (!userString) {
          Alert.alert("Login Required", "Please login again.");
          setLoading(false);
          return;
        }

        const user = JSON.parse(userString);
        const data = await getPlans(user.userId, user.token);
        setPlans(data);
      } catch (err) {
        Alert.alert("Error", "Failed to load plans");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handlePayment = async (plan) => {
    try {
      const userString = await AsyncStorage.getItem("user");
      if (!userString) {
        Alert.alert("Login Required", "Please login again.");
        return;
      }
      const user = JSON.parse(userString);
      const { userId, token, full_name, email } = user;

      setSelectedPlan(plan);

      if (plan.base_price === 0) {
        Alert.alert("Trial Plan Activated", "Enjoy your free trial!");
        return;
      }

      const res = await createOrder(userId, plan.id, token);

      // ✅ NOW ENABLE RAZORPAY
      const options = {
        key: res.key_id, // 'rzp_test_w7eHbASEFZ4b09' - correct ah varuthu
        amount: res.amount_paise, // 49900 - correct ah varuthu
        currency: "INR",
        name: "DigiAiQuest",
        description: `Payment for ${plan.name} plan`,
        order_id: res.order_id, // 'order_Ra2uPnGskeSKvf' - correct ah varuthu
        theme: { color: "#4F46E5" },
        prefill: {
          name: full_name || "User",
          email: email || "example@example.com",
        },
      };

      RazorpayCheckout.open(options)
        .then(async (response) => {

          const verifyData = {
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          };
          const result = await verifyPayment(verifyData);

          if (result.message === "Subscription activated successfully") {
            Alert.alert("✅ Success", "Your plan is now active!");
            await AsyncStorage.setItem("credits", result.credits.toString());
          } else {
            Alert.alert("Failed", result.message || "Verification failed");
          }
        })
        .catch((error) => {
          if (error.description) {
            Alert.alert("Payment Failed", error.description);
          } else {
            Alert.alert("Payment Cancelled", "You cancelled the payment.");
          }
        });

    } catch (err) {
           Alert.alert("Trial already used. Upgrade to continue!");
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="mt-3">Loading plans...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="bg-gray-50">
      <View className="items-center px-6 py-12 bg-blue-900 rounded-b-3xl overflow-hidden">
        <View className="absolute inset-0 opacity-20 bg-black">
          <Image
            source={require("../../assets/Home.jpg")}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
        <View className="z-10 items-center">
          <Text className="text-white font-extrabold text-xl mb-4">
            Smarter Learning with AI Begins Here
          </Text>
          <Text className="text-blue-100 text-center text-lg mb-6 px-4">
            Transform your learning experience with our revolutionary AI-powered examination platform.
          </Text>
        </View>
      </View>

      {/* Plans Section */}
      <View className="px-4 py-8">
        <Text className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Choose Your Plan
        </Text>

        <View className="flex-row flex-wrap justify-center" style={{ gap: 20 }}>
          {plans.map((plan, index) => (
            <View
              key={index}
              className="rounded-2xl overflow-hidden w-full max-w-md border border-gray-200 bg-white"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <LinearGradient
                colors={["#f8fafc", "#e2e8f0"]}
                className="p-6"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View className="mb-4">
                  <Text className="text-xl font-bold text-gray-900">
                    {plan.name}
                  </Text>
                  <View className="flex-row items-end mt-1">
                    <Text className="text-3xl font-extrabold text-gray-900">
                      ₹{plan.base_price}
                    </Text>
                  </View>
                </View>

                <View className="border-t border-gray-200 pt-4">
                  {plan.features?.map((feature, i) => (
                    <View key={i} className="flex-row items-start mb-3">
                      <Icon
                        name="check-circle"
                        size={18}
                        color="#10b981"
                        style={{ marginTop: 2 }}
                      />
                      <Text className="ml-2 text-gray-700 flex-1">
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  className="mt-6 rounded-xl py-3 bg-blue-500"
                  activeOpacity={0.8}
                  onPress={() => Razorpay(plan)}
                >
                  <Text className="text-center text-white font-semibold text-lg">
                    {plan.base_price === 0 ? "Activate Free Plan" : "Buy Now"}
                  </Text>
                </TouchableOpacity>

              </LinearGradient>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default Pricing;