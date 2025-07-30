// Importing required modules and components
import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Alert
} from 'react-native';
import firestore from '@react-native-firebase/firestore';

const InterestSelectionScreen = ({ navigation }) => {
  const [interests, setInterests] = useState([]); // All interests from Firestore
  const [selected, setSelected] = useState([]);   // User-selected interest IDs

  useEffect(() => {
    // Fetch interests from Firestore when component mounts
    const fetchInterests = async () => {
      try {
        const snapshot = await firestore().collection('Interests').get();

        // Map each document into an object with id and name
        const list = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.NameOfInterests, // Make sure Firestore field name matches this
          };
        });

        console.log('✅ Fetched interests:', list);
        setInterests(list);
      } catch (error) {
        Alert.alert('Error', error.message);
        console.log('❌ Firestore error:', error);
      }
    };

    fetchInterests();
  }, []);

  // Toggle selection state for an interest
  const toggleInterest = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Proceed to sign-up with selected interests
  const handleNext = () => {
    if (selected.length === 0) {
      Alert.alert('Please select at least one interest');
      return;
    }
    navigation.navigate('SignUp', { selectedInterests: selected });
  };

  // Render each interest as a selectable box
  const renderBox = ({ item }) => {
    const isActive = selected.includes(item.id);
    return (
      <TouchableOpacity
        style={[styles.box, isActive && styles.activeBox]}
        onPress={() => toggleInterest(item.id)}
      >
        <Text style={[styles.boxText, isActive && styles.activeText]}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select your interest</Text>
      <Text style={styles.subtitle}>
        Choose what events and activity you would like to see
      </Text>

      {/* Show loading message if interests not yet loaded */}
      {interests.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20, color: 'gray' }}>
          Loading interests...
        </Text>
      ) : (
        <FlatList
          data={interests}
          renderItem={renderBox}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
        />
      )}

      {/* NEXT button */}
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>NEXT →</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles for the interest selection screen components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0b0b38',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#444',
    marginBottom: 20,
  },
  grid: {
    paddingBottom: 20,
  },
  box: {
    flex: 1,
    margin: 6,
    borderWidth: 1.5,
    borderColor: '#ccc',
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBox: {
    backgroundColor: '#5c4dd2',
    borderColor: '#5c4dd2',
  },
  boxText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  activeText: {
    color: '#fff',
  },
  button: {
    marginTop: 'auto',
    backgroundColor: '#5c4dd2',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

// Export component
export default InterestSelectionScreen;
