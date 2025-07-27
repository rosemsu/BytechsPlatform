import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

//this page is just a place holder for now (used in home page )
const EventsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Events</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack('HomeScreen')}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EventsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f6ff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#5c4dd2',
  },
  button: {
    backgroundColor: '#5c4dd2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
