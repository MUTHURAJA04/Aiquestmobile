// components/Layout.jsx
import React, { useContext, useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StatusBar,
  Image,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomModal from './CustomModal';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import OtpModal from './OtpModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import { useNavigation } from '@react-navigation/native';
import { ModalContext } from '../components/ModalContext';

const Layout = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const navigation = useNavigation();

  const {
    isLoginModalVisible,
    setLoginModalVisible,
    isSignupMode,
    setSignupMode,
    openLogin,
    isOtpModalVisible,
    setOtpModalVisible,
    sentToEmail,
    setSentToEmail,
    isForgotPasswordVisible,
    setForgotPasswordVisible,
  } = useContext(ModalContext);

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

  return (
    <>
      <StatusBar animated backgroundColor="#152763" barStyle="light-content" />
      <SafeAreaView
        className={`flex-1 ${
          Platform.OS === 'android' ? 'bg-blue-900' : 'bg-white'
        }`}
      >
        <View className="h-[70px] bg-[#152763] flex-row items-center justify-between px-4 relative">
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Image
              source={require('../assets/Logo.png')}
              style={{ width: 90, height: 90 }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {user ? (
            <View className="flex-row items-center justify-between">
             {/* User Credits (Header Style) */}

              {/* Account Icon + Name (Right Side) */}
              <TouchableOpacity
                onPress={() => setShowDropdown(!showDropdown)}
                className="items-center"
              >
                <Icon name="account-circle" size={28} color="#fff" />
                <Text
                  className="text-white text-xs w-28 text-center mt-1"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {user.fullName}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={openLogin}
              className="items-center bg-blue-800 p-2 rounded"
            >
              <Text className="text-white text-sm font-medium">Login</Text>
            </TouchableOpacity>
          )}

          {showDropdown && (
            <View className="absolute top-16 right-4 bg-white rounded-lg shadow-lg p-3 z-50 w-40">
              <Text
                className="text-gray-800 mb-2 font-semibold"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Hello, {user?.fullName}
              </Text>
              <TouchableOpacity onPress={handleLogout}>
                <Text className="text-red-600">Logout</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View className="flex-1 bg-white">{children}</View>

        <View className="h-16 bg-white flex-row justify-around items-center border-t border-gray-200">
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              className="items-center"
              onPress={async () => {
                if (!user && action.route !== 'Home') {
                  openLogin();
                  return;
                }
                setActiveTab(action.route);
                navigation.navigate(action.route);
              }}
            >
              <Icon
                name={action.name}
                size={26}
                color={activeTab === action.route ? '#3b82f6' : '#6b7280'}
              />
              <Text
                className={`text-xs ${
                  activeTab === action.route
                    ? 'text-blue-600 font-bold'
                    : 'text-gray-500'
                }`}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Login / Signup Modal */}
        <CustomModal
          visible={isLoginModalVisible}
          onClose={() => setLoginModalVisible(false)}
          title={isSignupMode ? 'Sign Up' : 'Login'}
        >
          {isSignupMode ? (
            <SignupForm
              onSwitch={() => setSignupMode(false)}
              onSuccess={email => {
                setSentToEmail(email);
                setOtpModalVisible(true);
                setLoginModalVisible(false);
              }}
            />
          ) : (
            <LoginForm
              onSwitch={() => setSignupMode(true)}
              prefillEmail={sentToEmail}
              onForgotPasswordClick={() => {
                setLoginModalVisible(false);
                setForgotPasswordVisible(true);
              }}
              onLogin={userData => {
                setUser(userData);
                setLoginModalVisible(false);
              }}
            />
          )}
        </CustomModal>

        <ForgotPasswordModal
          visible={isForgotPasswordVisible}
          onClose={() => {
            setForgotPasswordVisible(false);
            setLoginModalVisible(true);
          }}
        />

        <OtpModal
          visible={isOtpModalVisible}
          onClose={() => setOtpModalVisible(false)}
          email={sentToEmail}
          onVerified={() => {
            setOtpModalVisible(false);
            setSignupMode(false);
            setLoginModalVisible(true);
          }}
        />
      </SafeAreaView>
    </>
  );
};

export default Layout;
