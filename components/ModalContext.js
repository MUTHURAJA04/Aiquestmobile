// context/ModalContext.js
import React, { createContext, useState } from 'react';

export const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [isLoginModalVisible, setLoginModalVisible] = useState(false);
  const [isSignupMode, setSignupMode] = useState(false);
  const [isOtpModalVisible, setOtpModalVisible] = useState(false);
  const [isForgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');

  const openLogin = () => {
    setSignupMode(false);
    setLoginModalVisible(true);
  };

  const openSignup = () => {
    setSignupMode(true);
    setLoginModalVisible(true);
  };

  return (
    <ModalContext.Provider
      value={{
        isLoginModalVisible,
        setLoginModalVisible,
        isSignupMode,
        setSignupMode,
        openLogin,
        openSignup,
        isOtpModalVisible,
        setOtpModalVisible,
        sentToEmail,
        setSentToEmail,
        isForgotPasswordVisible,
        setForgotPasswordVisible,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};
