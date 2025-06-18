import React, { useState, useEffect } from 'react';
import { TextInput, TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { loginUser } from '../services/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const LoginForm = ({ onSwitch, onLogin, prefillEmail = '', onForgotPasswordClick }) => {
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (prefillEmail) setEmail(prefillEmail);
  }, [prefillEmail]);

  const handleLogin = async () => {
    setLoading(true);
    setMessage('');
    try {
      const result = await loginUser({ email, password });
      if (result.success) {
        await AsyncStorage.setItem('user', JSON.stringify(result));
        onLogin(result);
      } else {
        setMessage(result.message || 'Invalid credentials');
      }
    } catch {
      setMessage('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TextInput
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        className="border border-gray-300 rounded px-3 py-2 mb-3"
        value={email}
        onChangeText={setEmail}
      />

      <View className="relative mb-3">
        <TextInput
          placeholder="Password"
          secureTextEntry={!showPassword}
          className="border border-gray-300 rounded px-3 py-2 pr-10"
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-2.5"
        >
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#555" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onForgotPasswordClick}>
        <Text className="text-blue-600 text-sm mb-3 text-right">Forgot Password?</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="small" color="#1e40af" className="mb-3" />
      ) : (
        <TouchableOpacity onPress={handleLogin} className="bg-blue-600 rounded py-2 mb-3">
          <Text className="text-white text-center font-semibold">Login</Text>
        </TouchableOpacity>
      )}

      {message ? (
        <Text className="text-center text-red-600 text-sm mb-2">{message}</Text>
      ) : null}

      <TouchableOpacity onPress={onSwitch} className="mt-2">
        <Text className="text-blue-600 text-sm text-center">No account? Sign Up</Text>
      </TouchableOpacity>
    </>
  );
};

export default LoginForm;
