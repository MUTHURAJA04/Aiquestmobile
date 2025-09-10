import React, { useState, useEffect } from 'react';
import {
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { googleSSOLogin, loginUser } from '../services/apiClient';
import Geolocation from 'react-native-geolocation-service';
import { useAuth } from './AuthContext';

const LoginForm = ({ onSwitch, onLogin, prefillEmail = '', onForgotPasswordClick }) => {
  const { login } = useAuth();

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [geoLoading, setGeoLoading] = useState(true);
  const [geoError, setGeoError] = useState('');

  useEffect(() => {
  GoogleSignin.configure({
  webClientId: "166620426117-fao3oh656sbjp40qf79gfk7r0nbtps2b.apps.googleusercontent.com",
  androidClientId: "166620426117-6nmcmudq8p1iv1d86rn6i9q20ehedeeg.apps.googleusercontent.com",
  offlineAccess: true,
});


  }, []);

  // ✅ Geolocation setup
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            setGeoError('Location permission denied');
            setGeoLoading(false);
            return;
          }
        }

        Geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                {
                  headers: {
                    'User-Agent': 'YourAppName/1.0 (your@email.com)',
                  },
                }
              );

              const data = await res.json();
              setCountry(data?.address?.country || '');
              setState(data?.address?.state || '');
              setGeoLoading(false);
            } catch (err) {
              console.error('Fetch error:', err);
              setGeoError('Failed to fetch location');
              setGeoLoading(false);
            }
          },
          (error) => {
            console.error('Geolocation error:', error);
            setGeoError('Unable to get location');
            setGeoLoading(false);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } catch (err) {
        console.error('Permission error:', err);
        setGeoError('Permission error');
        setGeoLoading(false);
      }
    };

    requestLocationPermission();
  }, []);

  // ✅ Validation
  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) return 'Email is required';
    if (/\s/.test(email)) return 'Email cannot contain spaces';

    // 🚫 First or last char cannot be dot/@
    if (/^[.@]/.test(email)) return 'Email cannot start with "." or "@"';
    if (/[.@]$/.test(email)) return 'Email cannot end with "." or "@"';

    if (!emailRegex.test(email)) return 'Enter a valid email address';
    if (email.length < 5 || email.length > 50) {
      return 'Email must be between 5–50 characters';
    }

    if (!password.trim()) return 'Password is required';
    if (/\s/.test(password)) return 'Password cannot contain spaces';
    if (password.length < 8 || password.length > 20) {
      return 'Password must be between 8–20 characters';
    }

    if (!country || !state) {
      return 'Location detection failed. Please enable GPS';
    }

    return null;
  };

  // ✅ Email login
  const handleLogin = async () => {
    const error = validateForm();
    if (error) {
      setMessage(error);
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const result = await loginUser({
        email,
        password,
        country,
        state,
      });

      if (result?.success) {
        await AsyncStorage.setItem('user', JSON.stringify(result));
        login(result, result.token);
        onLogin?.(result);
      } else {
        setMessage(result?.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setMessage('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setMessage('');

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      console.log("🔍 Full Google userInfo:", JSON.stringify(userInfo, null, 2));

      const idToken = userInfo.idToken || userInfo.data?.idToken;
      if (!idToken) throw new Error("Missing Google ID token");

      // Prepare payload for backend
      const ssoPayload = {
        google_id_token: idToken,
        country: country || "",
        state: state || "",
      };

      const result = await googleSSOLogin(ssoPayload);

      if (result?.success) {
        // ✅ Login success
        await AsyncStorage.setItem('user', JSON.stringify(result));
        login(result, result.token);
        onLogin?.(result);
        Alert.alert("Login Successful", result.message || "Welcome back!");
      } else {
        // ❌ Login failed
        if (result.googleEmail) {
          // Case: duplicate key error → suggest email login
          setEmail(result.googleEmail);
          Alert.alert(
            "Use Email Login", 
            result.message,
            [{ text: "OK" }]
          );
        } else {
          setMessage(result?.message || "Google login failed");
          Alert.alert("Login Failed", result?.message || "Please try again.");
        }
      }
    } catch (error) {
      console.error("Google Sign-In error:", error);
      Alert.alert("Google Login Error", error?.message || "Unknown error");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View>
      {/* Email */}
      <TextInput
        placeholder="Email"
        placeholderTextColor="black"
        keyboardType="email-address"
        autoCapitalize="none"
        className="border border-gray-300 rounded px-3 py-2 mb-3 text-black"
        value={email}
        onChangeText={(text) => setEmail(text.replace(/\s/g, ''))}
      />

      {/* Password */}
      <View className="relative mb-3">
        <TextInput
          placeholder="Password"
          placeholderTextColor="black"
          secureTextEntry={!showPassword}
          className="border border-gray-300 rounded px-3 py-2 pr-10 text-black"
          value={password}
          maxLength={20}
          onChangeText={(text) => setPassword(text.replace(/\s/g, ''))}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-2.5"
        >
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#555" />
        </TouchableOpacity>
      </View>

      {geoLoading && (
        <Text className="text-xs text-gray-500 mb-2">Detecting location...</Text>
      )}
      {geoError ? (
        <Text className="text-xs text-red-500 mb-2">{geoError}</Text>
      ) : null}

      <TouchableOpacity onPress={() => onForgotPasswordClick?.()}>
        <Text className="text-blue-600 text-sm mb-3 text-right">Forgot Password?</Text>
      </TouchableOpacity>

      {loading || googleLoading ? (
        <ActivityIndicator size="small" color="#1e40af" className="mb-3" />
      ) : (
        <>
          <TouchableOpacity onPress={handleLogin} className="bg-blue-600 rounded py-2 mb-3">
            <Text className="text-white text-center font-semibold">Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleGoogleLogin}
            className="bg-red-600 rounded py-2 mb-3 flex-row items-center justify-center"
          >
            <Ionicons name="logo-google" size={20} color="white" />
            <Text className="text-white text-center font-semibold ml-2">
              Continue with Google
            </Text>
          </TouchableOpacity>
        </>
      )}

      {message ? (
        <Text className="text-center text-red-600 text-sm mb-2">{message}</Text>
      ) : null}

      <TouchableOpacity onPress={onSwitch} className="mt-2">
        <Text className="text-blue-600 text-sm text-center">No account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginForm;



