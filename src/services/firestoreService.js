import firestore from '@react-native-firebase/firestore';

// Function to fetch the user's full name
const getUserFullName = async (userId) => {
  if (!userId) return null;
  try {
    const userDoc = await firestore().collection('Users').doc(userId).get();
    if (userDoc.exists) {
      return userDoc.data()?.FullName || null;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user full name:", error);
    throw error; // Or return null/default
  }
};

// Function to fetch all interests
const getInterests = async () => {
  try {
    const interestsSnapshot = await firestore().collection('interests').get();
    const interestsMap = {};
    interestsSnapshot.forEach(doc => {
      interestsMap[doc.id] = doc.data().name;
    });
    return interestsMap;
  } catch (error) {
    console.error("Error fetching interests:", error);
    throw error; // Or return an empty object
  }
};

// Function to fetch upcoming events
const getUpcomingEvents = async (limitCount = 2) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventsSnap = await firestore()
      .collection('Events')
      .where('EventTimeAndDate', '>=', today)
      .orderBy('EventTimeAndDate', 'asc')
      .limit(limitCount)
      .get();

    return eventsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    throw error; // Or return an empty array
  }
};

// Function to fetch latest discussions
const getLatestDiscussions = async (limitCount = 3) => {
  try {
    const discussionsSnap = await firestore()
      .collection('discussions')
      .orderBy('createdAt', 'desc') // Assuming you have a createdAt field for sorting
      .limit(limitCount)
      .get();

    return discussionsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching latest discussions:", error);
    throw error; // Or return an empty array
  }
};

const upsertUserProfile = async (userData) => {
    const currentUser = auth().currentUser;
    if (!currentUser) throw new Error("No authenticated user found.");

    const { uid, email, displayName, photoURL } = currentUser;
    const userRef = firestore().collection('users').doc(uid);

    try {
        const userDoc = await userRef.get();
        const dataToStore = {
           uid, // Redundant as it's the doc ID, but can be useful
           email,
           displayName: userData?.displayName || displayName || email.split('@')[0], // Prioritize passed data, then auth, then default
           photoURL: userData?.photoURL || photoURL || null,
           joinedAt: userDoc.exists ? userDoc.data()?.joinedAt : firestore.FieldValue.serverTimestamp(), // Keep original joinedAt if exists
           // ... any other fields you want to initialize or update from userData
        };
        await userRef.set(dataToStore, { merge: true }); // Use merge to avoid overwriting existing fields unintentionally
        console.log("User profile upserted:", uid);
        return dataToStore;
    } catch (error) {
        console.error("Error upserting user profile:", error);
        throw error;
    }
};


const createEvent = async (eventData) => {
   const currentUser = auth().currentUser;
    if (!currentUser) throw new Error("User must be logged in to create an event.");
    if (!eventData.title || !eventData.date || !eventData.time || !eventData.location) {
        throw new Error("Missing required event fields (title, date, time, location).");
    }

    try {
        const newEventRef = firestore().collection('events').doc(); // Auto-generate ID
        const timestampedEventData = {
            ...eventData,
            creatorId: currentUser.uid,
            createdAt: firestore.FieldValue.serverTimestamp(),
             // Ensure date and time are stored in a queryable format (e.g., Firestore Timestamp for date/time combined)
             // Example: eventDateTime: firestore.Timestamp.fromDate(new Date(`${eventData.date} ${eventData.time}`))
        };
        await newEventRef.set(timestampedEventData);
        console.log("Event created with ID:", newEventRef.id);
        return { id: newEventRef.id, ...timestampedEventData };
    } catch (error) {
       console.error("Error creating event:", error);
       throw error;
    }
};

const getUpcomingEvents = async (limitCount = 10) => {
  try {
    const now = firestore.Timestamp.now(); // Or Timestamp.fromDate(new Date())
    const eventsSnapshot = await firestore()
    .collection('events')
    .where('EventTimeAndDate', '>=', now) // Assuming you have 'eventStartTimestamp'
    .orderBy('EventTimeAndDate', 'asc')
    .limit(limitCount)
    .get();

    return eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    throw error;
    }
};

const getEventDetails = async (eventId) => {
  if (!eventId) throw new Error("Event ID is required.");
  try {
    const eventDoc = await firestore().collection('events').doc(eventId).get();
    if (!eventDoc.exists) {
      console.log('No such event!');
      return null;
    }
    return { id: eventDoc.id, ...eventDoc.data() };
  } catch (error) {
    console.error("Error fetching event details:", error);
    throw error;
  }
};


export default {
  getUserFullName,
  getInterests,
  getUpcomingEvents,
  getLatestDiscussions,
  upsertUserProfile,
  createEvent,
  getUpcomingEvents,
};
