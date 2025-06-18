import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// importing screens
import InterestSelectionScreen from './screens/InterestSelectionScreen';
import SignUpScreen from './screens/SignUpScreen';
import LoginScreen from './screens/LoginScreen';
import ForgotPasswordEmail from './screens/ForgotPasswordEmail';
import Verification from './screens/Verification';
import ResetPassword from './screens/ResetPassword';
import BottomTabNavigator from './screens/BottomTabNavigator';
import EventsScreen from './screens/EventsScreen';
//import HomeScreen from './screens/HomeScreen'; is not being used as the home page is loaded via the bottom tab navigator





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
        <Stack.Screen name="MainApp" component= {BottomTabNavigator} />
        <Stack.Screen name="EventsScreen" component={EventsScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;