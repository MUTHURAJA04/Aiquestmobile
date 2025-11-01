import React from "react";
import { Alert } from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createOrder, verifyPayment } from "../../services/apiClient";


const Razorpay = async (plan) => {
  try {
    const userString = await AsyncStorage.getItem("user");
    if (!userString) {
      Alert.alert("Login Required", "Please login again.");
      return;
    }

    const user = JSON.parse(userString);
    const { userId, token, full_name, email } = user;

    if (plan.base_price === 0) {
      Alert.alert("Trial Plan Activated", "Enjoy your free trial!");
      return;
    }

    // 1️⃣ Create Order
    const res = await createOrder(userId, plan.id, token);

    // 2️⃣ Razorpay options setup
    const options = {
      key: res.key_id, // example: rzp_test_abc123
      amount: res.amount_paise,
      currency: "INR",
      name: "DigiAiQuest",
      description: `Payment for ${plan.name} plan`,
      order_id: res.order_id,
      theme: { color: "#4F46E5" },
      prefill: {
        name: full_name || "User",
        email: email || "example@example.com",
      },
    };

    // 3️⃣ Open Razorpay
    RazorpayCheckout.open(options)
      .then(async (response) => {
        const verifyData = {
          order_id: response.razorpay_order_id,
          payment_id: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        };

        // 4️⃣ Verify Payment
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
          Alert.alert("Payment Failed", "Retry please");
        } else {
          Alert.alert("Payment Cancelled", "You cancelled the payment.");
        }
      });
  } catch (err) {
    Alert.alert("Error", "Something went wrong with payment.");
    console.error("RazorpayPayment Error:", err);
  }
};

export default Razorpay;
