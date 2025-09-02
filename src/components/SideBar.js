// Sidebar.js
import React, { createContext, useContext, useState } from 'react';
import { View, Animated, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';

const SidebarContext = createContext();

export const useSidebar = () => useContext(SidebarContext);

const Sidebar = ({ children }) => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => setSidebarVisible(prev => !prev);

  return (
    <SidebarContext.Provider value={{ sidebarVisible, toggleSidebar }}>
      <View style={{ flex: 1 }}>
        {/* Sidebar overlay */}
        {sidebarVisible && (
          <View style={styles.sidebar}>
            <Text style={styles.title}>Sidebar</Text>
            {/* Add your sidebar content here */}
            <TouchableOpacity onPress={toggleSidebar}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Render the actual app */}
        {children}
      </View>
    </SidebarContext.Provider>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions.get('window').width * 0.7, // 70% width
    height: '100%',
    backgroundColor: '#fff',
    zIndex: 1000,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  closeText: { color: '#5c4dd2', fontWeight: '600', marginTop: 10 },
});

export default Sidebar;
