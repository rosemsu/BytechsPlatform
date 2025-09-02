import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, StyleSheet, ScrollView } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firestoreService from '../services/firestoreService'; // Adjust path

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#fff' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  label: { fontSize: 16, fontWeight: '600', marginTop: 10, color: 'gray' },
  detailText: { fontSize: 16, marginBottom: 8 },
  buttonContainer: { marginTop: 20 },
  actionButton: { marginBottom: 10 }
});

const EventDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId } = route.params;

  const [loading, setLoading] = useState(false);
  const [eventDetails, setEventDetails] = useState(null);
  const [error, setError] = useState(null);
  const [hasTicket, setHasTicket] = useState(false);
  const [ticketActionLoading, setTicketActionLoading] = useState(false);
  const [ticketId, setTicketId] = useState(null); // Assuming acquireTicketForEvent returns ticketId

  const userId = auth().currentUser?.uid;

  const fetchScreenData = useCallback(async () => {
    if (!eventId || !userId) {
      setError("Event ID or User ID is missing.");
      Alert.alert("Error", "Event ID or User ID is missing.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const details = await firestoreService.getEventDetails(eventId);
      setEventDetails(details);
      if (details) { // Only check for ticket if event details were fetched
        const userHasTicket = await firestoreService.doesUserHaveTicketForEvent(userId, eventId);
        setHasTicket(userHasTicket);
        // If you need ticketId and doesUserHaveTicketForEvent doesn't return it,
        // you might need another function or modify doesUserHaveTicketForEvent
        // For simplicity, we'll assume acquireTicketForEvent will give us one for navigation.
      }
    } catch (e) {
      setError(e.message);
      Alert.alert("Error Fetching Details", e.message);
    } finally {
      setLoading(false);
    }
  }, [eventId, userId]);

  useFocusEffect(
    useCallback(() => {
      fetchScreenData();
      return () => {
        // Optional cleanup
      };
    }, [fetchScreenData])
  );


  const handleGetTicket = async () => {
    if (!userId) {
      Alert.alert("Error", "You must be logged in to get a ticket.");
      return;
    }
    setTicketActionLoading(true);
    try {
      const newTicket = await firestoreService.acquireTicketForEvent(eventId); // Assuming this returns {id: 'ticketId', ...}
      setHasTicket(true);
      setTicketId(newTicket.id); // Store ticketId if returned
      Alert.alert("Success", "You've got a ticket!");
      navigation.navigate('TicketConfirmation', { ticketId: newTicket.id, eventId: eventId });
    } catch (e) {
      Alert.alert("Ticket Error", e.message);
    } finally {
      setTicketActionLoading(false);
    }
  };

  if (loading && !eventDetails) {
    return <View style={styles.loader}><ActivityIndicator size="large" /></View>;
  }

  if (error && !eventDetails) {
    return <View style={styles.container}><Text style={styles.errorText}>Error: {error}</Text></View>;
  }

  if (!eventDetails) {
    return <View style={styles.container}><Text>Event not found.</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{eventDetails.EventName}</Text>
      {error && <Text style={styles.errorText}>Error: {error}</Text>}

      <Text style={styles.label}>Description:</Text>
      <Text style={styles.detailText}>{eventDetails.EventDetails}</Text>

      <Text style={styles.label}>Date & Time:</Text>
      <Text style={styles.detailText}>
        {eventDetails.EventTimeAndDate ? new Date(eventDetails.EventTimeAndDate.seconds * 1000).toLocaleString() : 'N/A'}
      </Text>

      <Text style={styles.label}>Location:</Text>
      <Text style={styles.detailText}>{eventDetails.EventLocation}</Text>

      <Text style={styles.label}>Organizer:</Text>
      <Text style={styles.detailText}>{eventDetails.EventOrganizer}</Text>

      <Text style={styles.label}>Tickets Held:</Text>
      <Text style={styles.detailText}>{eventDetails.NumberofSeats || 0}</Text>


      <View style={styles.buttonContainer}>
        {ticketActionLoading ? (
          <ActivityIndicator />
        ) : hasTicket ? (
          <Button
            title="View My Ticket"
            onPress={() => {
              // You might need to fetch the specific ticketId if not stored
              // For now, let's assume if they have a ticket, we can pass eventId to confirmation
              // Or, if acquireTicketForEvent returned ticketId and you stored it.
              if (ticketId) {
                 navigation.navigate('TicketConfirmation', { ticketId: ticketId, eventId: eventId });
              } else {
                // If ticketId is not readily available, you might need to query it
                // or just show a message. For this example, let's allow navigation with eventId.
                Alert.alert("Info", "You already have a ticket for this event. Navigating based on event ID for now.");
                navigation.navigate('TicketConfirmation', { eventId: eventId, userHasTicket: true });

              }
            }}
            color="green"
            style={styles.actionButton}
          />
        ) : (
          <Button title="Get Ticket" onPress={handleGetTicket} style={styles.actionButton} />
        )}
      </View>
      {/* Add Share Button Later */}
    </ScrollView>
  );
};

export default EventDetailScreen;
