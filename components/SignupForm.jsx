import React, { useState } from 'react';
import { TextInput, TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { signup } from '../services/apiClient';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SignupForm = ({ onSwitch, onSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setMessage('');

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await signup({ full_name: fullName, phone_number: phoneNumber, email, password });
      if (res.success) {
        onSuccess(email);
      } else {
        setMessage(res.message || 'Signup failed');
      }
    } catch {
      setMessage('Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TextInput
        placeholder="Full Name"
         placeholderTextColor="black"
        className="border border-gray-300 rounded px-3 py-2 mb-3 text-black"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        placeholder="Phone Number"
         placeholderTextColor="black"
        keyboardType="phone-pad"
        className="border border-gray-300 rounded px-3 py-2 mb-3 text-black"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      <TextInput
        placeholder="Email"
         placeholderTextColor="black"
        keyboardType="email-address"
        autoCapitalize="none"
        className="border border-gray-300 rounded px-3 py-2 mb-3 text-black"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password Field */}
      <View className="relative mb-3">
        <TextInput
          placeholder="Password"
          placeholderTextColor="black"
          secureTextEntry={!showPassword}
          className="border border-gray-300 rounded px-3 py-2 pr-10 text-black"
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5">
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Confirm Password Field */}
      <View className="relative mb-3">
        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor="black"
          secureTextEntry={!showConfirmPassword}
          className="border border-gray-300 rounded px-3 py-2 pr-10 text-black"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-2.5">
          <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#555" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#1e40af" className="mb-3" />
      ) : (
        <TouchableOpacity onPress={handleSignup} className="bg-blue-600 rounded py-2 mb-3">
          <Text className="text-white text-center font-semibold">Sign Up</Text>
        </TouchableOpacity>
      )}

      {message && <Text className="text-center text-red-600 text-sm mb-2">{message}</Text>}

      <TouchableOpacity onPress={onSwitch} className="mt-4">
        <Text className="text-blue-600 text-sm text-center">Already have an account? Login</Text>
      </TouchableOpacity>
    </>
  );
};

export default SignupForm;
