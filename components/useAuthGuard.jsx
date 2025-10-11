// hooks/useAuthGuard.js
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../components/AuthContext';

const useAuthGuard = () => {
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('AuthGuard: User not authenticated, redirecting to login');
      // Use replace to prevent going back
      navigation.replace('Login');
    }
  }, [isAuthenticated, navigation]);

  return isAuthenticated;
};

export default useAuthGuard;