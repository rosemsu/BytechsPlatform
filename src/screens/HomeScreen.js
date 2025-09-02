import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, ScrollView,
  TouchableOpacity, Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // <-- icon
import auth from '@react-native-firebase/auth';
import authService from '../services/authService';
import firestoreService from '../services/firestoreService';
import { useSidebar } from '../components/SideBar'; // <-- sidebar context

const HomeScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [discussions, setDiscussions] = useState([]);
  const [events, setEvents] = useState([]);
  const [interestsMap, setInterestsMap] = useState({});

  const { toggleSidebar } = useSidebar(); // <-- get toggle function

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert("Error", "No user logged in.");
        setLoading(false);
        return;
      }

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
      setFullName('User');
      setInterestsMap({});
      setEvents([]);
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    const unsubscribeFocus = navigation.addListener('focus', () => {});
    return () => unsubscribeFocus();
  }, [navigation, fetchUserData]);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#5c4dd2" size="large" />
      </View>
    );
  }

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      navigation.replace('Login');
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Sidebar Button - Top Left */}
      <TouchableOpacity style={styles.sidebarButton} onPress={toggleSidebar}>
        <Ionicons name="menu" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Header */}


      <View style={styles.header}>
        <Text style={styles.welcome}>Hi {fullName}, 👋</Text>
        <Text style={styles.subtitle}>Welcome Back!</Text>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Featured Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How to Become Designer</Text>
        <Text style={styles.sectionSub}>UI/UX Specialized</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => Alert.alert("Navigate", "Navigate to relevant discussion")}
        >
          <Text style={styles.buttonText}>Join Discussion</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Events */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <TouchableOpacity onPress={() => navigation.navigate('EventsScreen')}>
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

      {/* Newest Discussions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Newest Discussions</Text>
        </View>
        {discussions.length > 0 ? discussions.map(d => (
          <TouchableOpacity
            key={d.id}
            style={styles.card}
            onPress={() => navigation.navigate('DiscussionDetail', { discussionId: d.id })}
          >
            <Text style={styles.eventTitle}>{d.title}</Text>
            <Text style={styles.eventLocation} numberOfLines={2}>{d.description}</Text>
          </TouchableOpacity>
        )) : <Text style={styles.noDataText}>No new discussions.</Text>}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#f6f6ff', padding: 20, flexGrow: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 30, paddingTop: 70, }, // leave space for sidebar button
  welcome: { fontSize: 22, fontWeight: 'bold', color: '#5c4dd2' },
  subtitle: { fontSize: 16, color: '#555', marginTop: 4 },
  section: { marginBottom: 25 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  sectionSub: { fontSize: 14, color: '#666', marginBottom: 10 },
  button: { backgroundColor: '#5c4dd2', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  eventName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4, color: '#222' },
  eventDate: { fontSize: 12, color: '#5c4dd2', fontWeight: 'bold' },
  eventTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  eventLocation: { fontSize: 14, color: '#777' },
  eventCity: { fontSize: 13, color: '#999', marginBottom: 4 },
  interestsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  interestTag: { backgroundColor: '#e2dfff', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12, marginRight: 6, marginTop: 4 },
  interestText: { fontSize: 12, color: '#5c4dd2' },
  seeAllText: { fontSize: 14, color: '#5c4dd2', fontWeight: '600' },
  signOutButton: { alignSelf: 'flex-end', backgroundColor: '#f44336', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 6, marginBottom: 10 },
  signOutText: { color: '#fff', fontWeight: '600' },
  noDataText: { textAlign: 'center', color: '#777', marginTop: 10, marginBottom: 10 },

  // Sidebar button
  sidebarButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#5c4dd2',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
});

export default HomeScreen;
