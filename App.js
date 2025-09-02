import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import InterestSelectionScreen from './src/screens/InterestSelectionScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import LoginScreen from './src/screens/LoginScreen';
import ForgotPasswordEmail from './src/screens/ForgotPasswordEmail';
import Verification from './src/screens/Verification';
import ResetPassword from './src/screens/ResetPassword';
import BottomTabNavigator from './src/screens/BottomTabNavigator';
import MainLayout from './src/components/SideBar';
//import { SidebarProvider } from './src/screens/SideBar';

const Stack = createNativeStackNavigator();

const App = () => {
  return (

    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Interests"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#fff' },
        }}
      >
        <Stack.Screen name="Interests" component={InterestSelectionScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ForgotPasswordEmail" component={ForgotPasswordEmail} />
        <Stack.Screen name="Verification" component={Verification} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />


        <Stack.Screen name="MainApp">
  {() => (
    <MainLayout>
      <BottomTabNavigator />
    </MainLayout>
  )}
</Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>

  );
};

export default App;
