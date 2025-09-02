// BottomTabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import Sidebar, { useSidebar } from '../components/SideBar'; // Your sidebar wrapper

// Screens
import HomeScreen from './HomeScreen';
import CommunityScreen from './CommunityScreen';
import ChatScreen from './ChatScreen';
import ExploreScreen from './ExploreScreen';
import EventsScreen from './EventsScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const { sidebarVisible } = useSidebar();

  return (
    <Sidebar>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#5c4dd2',
          tabBarInactiveTintColor: '#888',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 0.5,
            borderTopColor: '#ddd',
            display: sidebarVisible ? 'none' : 'flex',
          },
          tabBarIcon: ({ color, size }) => {
            let iconName;
            switch (route.name) {
              case 'Home': iconName = 'home-outline'; break;
              case 'Chat': iconName = 'chatbubble-outline'; break;
              case 'Events': iconName = 'calendar-outline'; break;
              case 'Explore': iconName = 'compass-outline'; break;
              case 'Community': iconName = 'people-outline'; break;
              default: iconName = 'ellipse-outline';
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home">
          {({ navigation, route }) => (
            <HomeScreen navigation={navigation} route={route} />
          )}
        </Tab.Screen>

        <Tab.Screen name="Chat">
          {({ navigation, route }) => (
            <ChatScreen navigation={navigation} route={route} />
          )}
        </Tab.Screen>

        <Tab.Screen name="Events">
          {({ navigation, route }) => (
            <EventsScreen navigation={navigation} route={route} />
          )}
        </Tab.Screen>

        <Tab.Screen name="Explore">
          {({ navigation, route }) => (
            <ExploreScreen navigation={navigation} route={route} />
          )}
        </Tab.Screen>

        <Tab.Screen name="Community">
          {({ navigation, route }) => (
            <CommunityScreen navigation={navigation} route={route} />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </Sidebar>
  );
};

export default BottomTabNavigator;
