
// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import Layout from './components/Layout';
// import './global.css';

// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import { ModalProvider } from './components/ModalContext';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';
// import Toast from 'react-native-toast-message';

// import LayoutNavigator from './components/LayoutNavigator';
// import { AuthProvider } from './components/AuthContext';


// GoogleSignin.configure({
//   webClientId: '661079164627-63hk1g0vsum04b3rdor27ui0h72jfdlo.apps.googleusercontent.com', // <-- your Web client ID
//   offlineAccess: true, // if you need server auth code
// });

// const App = () => {
//   return (
//     <GestureHandlerRootView style={{flex: 1}}>
//       <AuthProvider> {/* Wrap everything with AuthProvider */}
//         <ModalProvider>
//           <NavigationContainer>
//             <Layout>
//               <LayoutNavigator />
//             </Layout>
//           </NavigationContainer>
//           <Toast />
//         </ModalProvider>
//       </AuthProvider>
//     </GestureHandlerRootView>
//   );
// };

// export default App;









// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Layout from './components/Layout';
import './global.css';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ModalProvider } from './components/ModalContext';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Toast from 'react-native-toast-message';

import LayoutNavigator from './components/LayoutNavigator';
import { AuthProvider } from './components/AuthContext';
import { AppProvider } from './components/AppContext';



GoogleSignin.configure({
  webClientId: "166620426117-fao3oh656sbjp40qf79gfk7r0nbtps2b.apps.googleusercontent.com",
  // androidClientId: "166620426117-6nmcmudq8p1iv1d86rn6i9q20ehedeeg.apps.googleusercontent.com",
  offlineAccess: true,
});



const App = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AuthProvider>
        <AppProvider> {/* Add AppProvider here */}
          <ModalProvider>
            <NavigationContainer>
              <Layout>
                <LayoutNavigator />
              </Layout>
            </NavigationContainer>
            <Toast />
          </ModalProvider>
        </AppProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
};

export default App;