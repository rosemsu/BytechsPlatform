import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Alert, StyleSheet, Button } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import firestoreService from '../services/firestoreService'; // Adjust path

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0fff0' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', textAlign: 'center', marginBottom: 10 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: 'green' },
  infoText: { fontSize: 16, marginBottom: 8, textAlign: 'center' },
  eventTitle: { fontSize: 18, fontWeight: '600', marginBottom: 5, textAlign: 'center' },
});

const TicketConfirmationScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { ticketId, eventId, userHasTicket } = route.params; // userHasTicket is a fallback if ticketId isn't passed

  const [loading, setLoading] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConfirmation = async () => {
      setLoading(true);
      setError(null);
      try {
        let data;
        if (ticketId) {
          data = await firestoreService.getTicketConfirmationDetails(ticketId);
        } else if (eventId && userHasTicket) {
          // Fallback: If we only have eventId and know user has a ticket
          // Fetch event details and show a generic confirmation
          const eventDetails = await firestoreService.getEventDetails(eventId);
          data = {
            ticket: { note: "Your ticket is confirmed." }, // Generic ticket info
            event: eventDetails
          };
        } else {
          throw new Error("Required information (ticketId or eventId) not provided.");
        }
        setConfirmationData(data);
      } catch (e) {
        setError(e.message);
        Alert.alert("Error", e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConfirmation();
  }, [ticketId, eventId, userHasTicket]);

  if (loading) {
    return <View style={styles.loader}><ActivityIndicator size="large" /></View>;
  }

  if (error) {
    return <View style={styles.container}><Text style={styles.errorText}>Error: {error}</Text></View>;
  }

  if (!confirmationData) {
    return <View style={styles.container}><Text>No confirmation data found.</Text></View>;
  }

  const { ticket, event } = confirmationData;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ticket Confirmed!</Text>
      {event && (
        <>
          <Text style={styles.infoText}>You're all set for:</Text>
          <Text style={styles.eventTitle}>{event.EventName}</Text>
          <Text style={styles.infoText}>
            On: {event.EventTimeAndDate ? new Date(event.EventTimeAndDate.seconds * 1000).toLocaleDateString() : 'N/A'}
          </Text>
          <Text style={styles.infoText}>
            At: {event.EventTimeAndDate ? new Date(event.EventTimeAndDate.seconds * 1000).toLocaleTimeString() : 'N/A'}
          </Text>
          <Text style={styles.infoText}>Location: {event.EventLocation}</Text>
        </>
      )}
      {ticket && ticket.id && <Text style={styles.infoText}>Ticket ID: {ticket.id}</Text>}
      {ticket && ticket.acquiredAt && (
        <Text style={styles.infoText}>
          Acquired: {new Date(ticket.acquiredAt.seconds * 1000).toLocaleString()}
        </Text>
      )}
       {ticket && ticket.note && <Text style={styles.infoText}>{ticket.note}</Text>}


      <Button title="Done" onPress={() => navigation.navigate('MainApp')} />
    </View>
  );
};

export default TicketConfirmationScreen;
