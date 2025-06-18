// currently working on this page 
// Importing required modules and components
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, ScrollView,
  TouchableOpacity
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
// import { SafeAreaView } from 'react-native'; ---- SafeAreaView import not being used – can be removed unless needed

const HomeScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState(''); // Logged-in user's name
  const [loading, setLoading] = useState(true); // Spinner visibility
  const [discussions, setDiscussions] = useState([]); // Latest discussions
  const [events, setEvents] = useState([]); // Upcoming events
  const [interestsMap, setInterestsMap] = useState({}); // Map interest ID to name

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      // Get user name from Users collection
      const userDoc = await firestore().collection('Users').doc(currentUser.uid).get();
      if (userDoc.exists) {
        setFullName(userDoc.data()?.FullName || 'User');
      }

      // Build map of { interestId: interestName }
      const interestsSnapshot = await firestore().collection('interests').get();
      const map = {};
      interestsSnapshot.forEach(doc => map[doc.id] = doc.data().name);
      setInterestsMap(map);

      // Create a JS Date for midnight today (used for filtering future events)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch up to 2 upcoming events (sorted soonest first)
      const eventsSnap = await firestore()
        .collection('Events')
        .where('EventTimeAndDate', '>=', today)
        .orderBy('EventTimeAndDate', 'asc')
        .limit(2)
        .get();

      const eventsData = eventsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData);

      // Fetch latest 3 discussions
      const discussionsSnap = await firestore()
        .collection('discussions')
        .limit(3)
        .get();

      const discussionsData = discussionsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDiscussions(discussionsData);

      setLoading(false); // Finished fetching all data
    };

    fetchUserData();
  }, []);

  // Show loading screen while data is being fetched
  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#5c4dd2" size="large" />
      </View>
    );
  }

// to sign out
  const handleSignOut = async () => {
  try {
    await auth().signOut();
    navigation.replace('Login'); // replace to prevent going back with back button
  } catch (error) {
    console.error('Sign out error:', error);
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
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Join Discussion</Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Events Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Events</Text>
          <TouchableOpacity onPress={() => navigation.navigate('EventsScreen')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* List of events */}
        {events.map(event => (
          <View key={event.id} style={styles.card}>
            <Text style={styles.eventName}>{event.EventName}</Text>
            <Text style={styles.eventDate}>
              {event.EventTimeAndDate?.toDate().toLocaleDateString()}
            </Text>
            <Text style={styles.eventLocation}>{event.EventLocation}</Text>
            <Text style={styles.eventCity}>{event.EventCity}</Text>



            {/* Tags from interest IDs */}
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
        ))}
      </View>

      {/* Newest Discussions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Newest Discussions</Text>
        {discussions.map(d => (
          <View key={d.id} style={styles.card}>
            <Text style={styles.eventTitle}>{d.title}</Text>
            <Text style={styles.eventLocation}>{d.description}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

// Styles for layout and UI
const styles = StyleSheet.create({
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
    marginBottom: 8,
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
    marginBottom: 12,
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
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  eventLocation: {
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
  backgroundColor: '#f44336',
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 6,
  marginBottom: 10,
},
signOutText: {
  color: '#fff',
  fontWeight: '600',
},

});

// Export component
export default HomeScreen;
