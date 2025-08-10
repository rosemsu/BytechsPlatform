import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Button, StyleSheet } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import firestoreService from '../services/firestoreService'; // Adjust path

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  headerContainer: { padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', padding: 15, textAlign: 'center' },
  noEventsText: { textAlign: 'center', padding: 20, fontSize: 16, color: 'gray' },
  eventItem: { backgroundColor: 'white', padding: 15, marginVertical: 8, marginHorizontal: 10, borderRadius: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.20, shadowRadius: 1.41, elevation: 2 },
  eventTitle: { fontSize: 18, fontWeight: 'bold' },
  eventDate: { fontSize: 14, color: 'gray', marginTop: 5 },
});

const EventsListScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const upcomingEvents = await firestoreService.getUpcomingEvents();
      setEvents(upcomingEvents);
    } catch (e) {
      setError(e.message);
      Alert.alert("Error Fetching Events", e.message);
    } finally {
      setLoading(false);
    }
  };

  // useFocusEffect to refresh data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchEvents();
      return () => {
        // Optional: any cleanup
      };
    }, [])
  );

  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      style={styles.eventItem}
      onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
    >
      <Text style={styles.eventTitle}>{item.title}</Text>
      {item.eventStartTimestamp && (
        <Text style={styles.eventDate}>
          {new Date(item.eventStartTimestamp.seconds * 1000).toLocaleString()}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (loading && events.length === 0) {
    return <View style={styles.loader}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Upcoming Events</Text>
        <Button title="Create Event" onPress={() => navigation.navigate('CreateEvent')} />
      </View>
      {error && <Text style={styles.errorText}>Error: {error}</Text>}
      {!loading && events.length === 0 && !error && (
        <Text style={styles.noEventsText}>No upcoming events found. Create one!</Text>
      )}
      <FlatList
        data={events}
        renderItem={renderEventItem}
        keyExtractor={item => item.id}
        refreshing={loading}
        onRefresh={fetchEvents} // Pull-to-refresh
      />
    </View>
  );
};

export default EventsListScreen;
