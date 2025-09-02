import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, ScrollView,
  TouchableOpacity, Alert
} from 'react-native';
import auth from '@react-native-firebase/auth';
import authService from '../services/authService';
import firestoreService from '../services/firestoreService';

const HomeScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState(''); // Logged-in user's name
  const [loading, setLoading] = useState(true); // Spinner visibility
  const [discussions, setDiscussions] = useState([]); // Latest discussions
  const [events, setEvents] = useState([]); // Upcoming events
  const [interestsMap, setInterestsMap] = useState({}); // Map interest ID to name

  // useCallback to memoize fetchUserData unless dependencies change
  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = auth().currentUser; // Or get from a shared auth context/service
      if (!currentUser) {
        Alert.alert("Error", "No user logged in.");
        setLoading(false);
        // navigation.replace('Login'); // Optionally redirect to login
        return;
      }

      // Parallel fetching for better performance
      const [
        fetchedFullName,
        fetchedInterestsMap,
        fetchedEvents,
        fetchedDiscussions,
      ] = await Promise.all([
        firestoreService.getUserFullName(currentUser.uid),
        firestoreService.getInterests(),
        firestoreService.getUpcomingEvents(2),
        firestoreService.getLatestDiscussions(3),
      ]);

      setFullName(fetchedFullName || 'User');
      setInterestsMap(fetchedInterestsMap || {});
      setEvents(fetchedEvents || []);
      setDiscussions(fetchedDiscussions || []);

    } catch (error) {
      console.error("Failed to fetch home screen data:", error);
      Alert.alert("Error", "Could not load data. Please try again later.");
      // Set states to defaults or empty to prevent rendering issues
      setFullName('User');
      setInterestsMap({});
      setEvents([]);
      setDiscussions([]);
    } finally {
      setLoading(false); // Finished fetching all data
    }
  }, []); // No dependencies if currentUser is fetched inside or stable

  useEffect(() => {
    // Initial fetch
    fetchUserData();

    // Optional: Add a listener for screen focus if you want to refresh data when returning to the screen
    const unsubscribeFocus = navigation.addListener('focus', () => {
        // console.log('HomeScreen focused, consider re-fetching data if needed');
        // fetchUserData(); // Uncomment if you want to refresh on focus
    });

    return () => {
      unsubscribeFocus();
    };
  }, [navigation, fetchUserData]); // fetchUserData is now stable due to useCallback

  // Show loading screen while data is being fetched
  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#5c4dd2" size="large" />
      </View>
    );
  }

  // Use authService for sign out
  const handleSignOut = async () => {
    try {
      await authService.signOut(); // Use the service
      navigation.replace('Login'); // replace to prevent going back with back button
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* User Greeting */}
      <View style={styles.header}>
        <Text style={styles.welcome}>Hi {fullName}, 👋</Text>
        <Text style={styles.subtitle}>Welcome Back!</Text>
      </View>

      {/* Sign out button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Featured Section (Static for now) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How to Become Designer</Text>
        <Text style={styles.sectionSub}>UI/UX Specialized</Text>
        <TouchableOpacity
            style={styles.button}
            onPress={() => Alert.alert("Navigate", "Navigate to relevant discussion")} // Placeholder
        >
          <Text style={styles.buttonText}>Join Discussion</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Events Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <TouchableOpacity onPress={() => navigation.navigate('EventsListScreen')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {events.length > 0 ? events.map(event => (
          <View key={event.id} style={styles.card}>
            <Text style={styles.eventName}>{event.EventName}</Text>
            <Text style={styles.eventDate}>
              {event.EventTimeAndDate?.toDate().toLocaleDateString()}
            </Text>
            <Text style={styles.eventLocation}>{event.EventLocation}</Text>
            <Text style={styles.eventCity}>{event.EventCity}</Text>
            <View style={styles.interestsRow}>
              {event.interests?.map(id => (
                <View key={id} style={styles.interestTag}>
                  <Text style={styles.interestText}>
                    {interestsMap[id] || 'Unknown'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )) : <Text style={styles.noDataText}>No upcoming events.</Text>}
      </View>

      {/* Newest Discussions Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Newest Discussions</Text>
            {/* Optionally add a "See All" for discussions */}
            {/* <TouchableOpacity onPress={() => navigation.navigate('DiscussionsScreen')}>
                <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity> */}
        </View>
        {discussions.length > 0 ? discussions.map(d => (
          // Make discussion cards pressable to navigate to the discussion details
          <TouchableOpacity key={d.id} style={styles.card} onPress={() => navigation.navigate('DiscussionDetail', { discussionId: d.id })}>
            <Text style={styles.eventTitle}>{d.title}</Text>
            <Text style={styles.eventLocation} numberOfLines={2}>{d.description}</Text>
          </TouchableOpacity>
        )) : <Text style={styles.noDataText}>No new discussions.</Text>}
      </View>
    </ScrollView>
  );
};

// Styles for layout and UI (Add noDataText style)
const styles = StyleSheet.create({
  // ... (Your existing styles)
  container: {
    backgroundColor: '#f6f6ff',
    padding: 20,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
  },
  welcome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#5c4dd2',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    // marginBottom: 8, // Removed as sectionHeader has marginBottom
  },
  sectionSub: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#5c4dd2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12, // Ensure this doesn't conflict if it's the last item in a section
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  eventName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#222',
  },
  eventDate: {
    fontSize: 12,
    color: '#5c4dd2',
    fontWeight: 'bold',
  },
  eventTitle: { // Used for discussion titles as well
    fontSize: 16,
    fontWeight: '600',
    color: '#333', // Make it consistent
    marginBottom: 4, // Added margin
  },
  eventLocation: { // Used for discussion descriptions as well
    fontSize: 14,
    color: '#777',
  },
  eventCity: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  interestTag: {
    backgroundColor: '#e2dfff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 6,
    marginTop: 4,
  },
  interestText: {
    fontSize: 12,
    color: '#5c4dd2',
  },
  seeAllText: {
    fontSize: 14,
    color: '#5c4dd2',
    fontWeight: '600',
  },
  signOutButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#f44336', // A common color for sign out/danger
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginBottom: 10, // Adjust as needed
  },
  signOutText: {
    color: '#fff',
    fontWeight: '600',
  },
  noDataText: { // New Style
    textAlign: 'center',
    color: '#777',
    marginTop: 10,
    marginBottom: 10,
  }
});

// Export component
export default HomeScreen;
