import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomModal = ({
  visible,
  onClose,
  title,
  children,
  centered = true,
  scrollable = false,
  fullWidth = false,
  contentStyle = '',
}) => {
  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <StatusBar animated backgroundColor="#000000" barStyle="light-content" />

      <TouchableWithoutFeedback onPress={onClose}>
        <View
          className={`flex-1 bg-black/30 px-4 ${centered ? 'justify-center items-center' : ''}`}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className={`w-full ${fullWidth ? 'max-w-full' : 'max-w-[360px]'}`}
          >
            <TouchableWithoutFeedback>
              <View
                className={`bg-white rounded-2xl p-5 shadow-lg ${scrollable ? 'max-h-[80%]' : ''} ${contentStyle}`}
              >
                {/* Header */}
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-lg font-semibold">{title}</Text>
                  <TouchableOpacity onPress={onClose} className="p-1">
                    <Icon name="close" size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                {/* Scrollable or static content */}
                {scrollable ? (
                  <ScrollView showsVerticalScrollIndicator={true}>
                    {children}
                  </ScrollView>
                ) : (
                  <View>{children}</View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CustomModal;
