// components/Layout.jsx
import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StatusBar, Image, Platform, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomModal from './CustomModal';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import OtpModal from './OtpModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import { useNavigation } from '@react-navigation/native';

const Layout = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [isOtpModalVisible, setOtpModalVisible] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');
  const [isForgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('Home'); 
  const navigation = useNavigation();
  useEffect(() => {
    AsyncStorage.getItem('user').then(data => {
      if (data) setUser(JSON.parse(data));
    });
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
    setShowDropdown(false);
  };

  const actions = [
    { name: 'home', label: 'Home', route: 'Home' },
    { name: 'star-circle', label: 'Features', route: 'Features' },
    { name: 'tools', label: 'Services', route: 'Services' },
    { name: 'account-circle', label: 'Profile', route: 'Profile' },
  ];
  const handlePress = (route) => {
    setActiveTab(route);
    navigation.navigate(route);
  };

  return (
    <>
      <StatusBar animated backgroundColor="#152763" barStyle="light-content" />
      <SafeAreaView className={`flex-1 ${Platform.OS === 'android' ? 'bg-blue-900' : 'bg-white'}`}>
        {/* Header */}
        <View className="h-16 bg-[#152763] flex-row items-center justify-between px-4 relative">
          <TouchableOpacity onPress={() => navigation.navigate("Home")} >
            <Image source={require('../assets/Logo.png')} style={{ width: 90, height: 90 }} resizeMode="contain" />
          </TouchableOpacity>

          {user ? (
            <TouchableOpacity onPress={() => setShowDropdown(!showDropdown)} className="items-center">
              <Icon name="account-circle" size={28} color="#fff" />
              <Text className="text-white text-xs mt-1">{user.fullName}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => { setModalVisible(true); setIsSignupMode(false); }} className="items-center bg-blue-800 p-2 rounded">
              <Text className="text-white text-sm font-medium">Login</Text>
            </TouchableOpacity>
          )}

          {showDropdown && (
            <View className="absolute top-16 right-4 bg-white rounded-lg shadow-lg p-3 z-50 w-40">
              <Text className="text-gray-800 mb-2 font-semibold">Hello, {user?.fullName}</Text>
              
              <TouchableOpacity onPress={handleLogout}>
                <Text className="text-red-600">Logout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="flex-1 bg-white">{children}</View>

      <View className="h-16 bg-white flex-row justify-around items-center border-t border-gray-200">
      {actions.map((action, index) => {
        const isActive = activeTab === action.route;
        return (
          <TouchableOpacity
            key={index}
            className="items-center"
            onPress={() => handlePress(action.route)}
          >
            <Icon
              name={action.name}
              size={26}
              color={isActive ? '#3b82f6' : '#6b7280'} // blue or gray
            />
            <Text className={`text-xs ${isActive ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
              {action.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>

        <CustomModal visible={isModalVisible} onClose={() => setModalVisible(false)} title={isSignupMode ? 'Sign Up' : 'Login'}>
          {isSignupMode ? (
            <SignupForm
              onSwitch={() => setIsSignupMode(false)}
              onSuccess={(email) => {
                setSentToEmail(email);
                setOtpModalVisible(true);
                setModalVisible(false);
              }}
            />
          ) : (
            <LoginForm
              onSwitch={() => setIsSignupMode(true)}
              prefillEmail={sentToEmail}
              onForgotPasswordClick={() => {
                setModalVisible(false);
                setForgotPasswordVisible(true);
              }}
              onLogin={(userData) => {
                setUser(userData);
                setModalVisible(false);
              }}
            />
          )}
        </CustomModal>

        <ForgotPasswordModal
          visible={isForgotPasswordVisible}
          onClose={() => {
            setForgotPasswordVisible(false);
            setModalVisible(true);
          }}
        />

        <OtpModal
          visible={isOtpModalVisible}
          onClose={() => setOtpModalVisible(false)}
          email={sentToEmail}
          onVerified={(res) => {
            console.log("OTP Verified 🎉", res);
            setOtpModalVisible(false);       // Close OTP modal
            setIsSignupMode(false);          // Force login mode
            setModalVisible(true);           // Open login modal
          }}
        />


      </SafeAreaView>
    </>
  );
};

export default Layout;
