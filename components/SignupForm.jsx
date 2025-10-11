import React, { useEffect, useState } from 'react';
import {
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';
import { signup } from '../services/apiClient';

const SignupForm = ({ onSwitch, onSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(true);
  const [geoError, setGeoError] = useState('');

  // ✅ Geolocation
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

  // ✅ Validation function
  const validateForm = () => {
    const nameRegex = /^[A-Za-z]{1,10}$/;
    // const phoneRegex = /^[0-9]{10}$/;
    const phoneRegex = /^[7-9][0-9]{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!fullName.trim()) return 'Name is required';
    if (!nameRegex.test(fullName)) return 'Name must be letters only (max 15)';

    if (!phoneNumber.trim()) return 'Phone Number is required';
    if (!phoneRegex.test(phoneNumber))
      return 'Phone Number must be 10 digits';

    if (!email.trim()) return 'Email is required';
    if (email.length > 50) return 'Email cannot exceed 50 characters';
    if (!emailRegex.test(email)) return 'Enter a valid email address';

    if (!password.trim()) return 'Password is required';
    if (password.includes(' ')) return 'Password cannot contain spaces';
    if (password.length < 8 || password.length > 20) return 'Password must be 8-20 characters';

    if (!confirmPassword.trim()) return 'Confirm Password is required';
    if (password !== confirmPassword) return 'Passwords do not match';

    if (!country || !state) return 'Location detection failed. Please enable GPS';

    return null;
  };

  // ✅ Signup handler
  const handleSignup = async () => {
    setMessage('');
    const error = validateForm();
    if (error) {
      setMessage(error);
      return;
    }

    setLoading(true);
    try {
      const res = await signup({
        full_name: fullName,
        phone_number: phoneNumber,
        email,
        password,
        country,
        state,
      });

      if (res.success) {
        Alert.alert('Signup Successful', 'You can now login', [
          { text: 'OK', onPress: () => onSuccess(email) },
        ]);
      } else {
        setMessage(res.message || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setMessage(err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>

      <TextInput
        placeholder="Full Name"
        value={fullName}
        onChangeText={(text) =>
          setFullName(text.replace(/[^A-Za-z]/g, '').slice(0, 20)) // letters only + max 15
        }
        placeholderTextColor="black"
        className="border border-gray-300 rounded px-3 py-2 mb-3 text-black"
      />


      <TextInput
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={(text) => {
          // Remove non-digits
          let cleaned = text.replace(/[^0-9]/g, '');
          // Prevent first digit 0-6
          if (cleaned.length === 1 && !/^[7-9]$/.test(cleaned)) cleaned = '';
          // Limit to 10 digits
          setPhoneNumber(cleaned.slice(0, 10));
        }}
        keyboardType="phone-pad"
        placeholderTextColor="black"
        className="border border-gray-300 rounded px-3 py-2 mb-3 text-black"
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={(text) =>
          setEmail(text.replace(/\s/g, '').slice(0, 50))
        }
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="black"
        className="border border-gray-300 rounded px-3 py-2 mb-3 text-black"
      />

      {/* Country & State (auto-filled) */}
      <TextInput
        placeholder="Country"
        value={country}
        editable={false}
        placeholderTextColor="black"
        className="border border-gray-300 rounded px-3 py-2 mb-3 text-black bg-gray-100"
      />
      <TextInput
        placeholder="State"
        value={state}
        editable={false}
        placeholderTextColor="black"
        className="border border-gray-300 rounded px-3 py-2 mb-3 text-black bg-gray-100"
      />

      {/* Password */}
      <View className="relative mb-3">
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={(text) =>
            setPassword(text.replace(/\s/g, '').slice(0, 20)) // no spaces + max 15
          }
          secureTextEntry={!showPassword}
          placeholderTextColor="black"
          className="border border-gray-300 rounded px-3 py-2 pr-10 text-black"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5">
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Confirm Password */}
      <View className="relative mb-3">
        <TextInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={(text) =>
            setConfirmPassword(text.replace(/\s/g, '').slice(0, 15)) // no spaces + max 15
          }
          secureTextEntry={!showConfirmPassword}
          placeholderTextColor="black"
          className="border border-gray-300 rounded px-3 py-2 pr-10 text-black"
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-2.5"
        >
          <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#555" />
        </TouchableOpacity>
      </View>

      {geoLoading && <Text className="text-xs text-gray-500 mb-2">Detecting location...</Text>}
      {geoError ? <Text className="text-xs text-red-500 mb-2">{geoError}</Text> : null}
      {message && <Text className="text-center text-red-600 text-sm mb-2">{message}</Text>}

      {loading ? (
        <ActivityIndicator size="small" color="#1e40af" className="mb-3" />
      ) : (
        <TouchableOpacity
          onPress={handleSignup}
          className="bg-blue-600 rounded py-2 mb-3"
          disabled={geoLoading || !!geoError}
        >
          <Text className="text-white text-center font-semibold">Sign Up</Text>
        </TouchableOpacity>
      )}

      <View className="mt-4 flex-row justify-center">
        <Text className="text-sm">Already have an account? </Text>
        <TouchableOpacity onPress={onSwitch}>
          <Text className="text-blue-600 text-sm underline">Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignupForm;
