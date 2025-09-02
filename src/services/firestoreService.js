import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth'; // <-- ADD THIS LINE

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
//
//// Function to fetch upcoming events
//const getUpcomingEvents = async (limitCount = 2) => {
//  try {
//    const today = new Date();
//    today.setHours(0, 0, 0, 0);
//
//    const eventsSnap = await firestore()
//      .collection('Events')
//      .where('EventTimeAndDate', '>=', today)
//      .orderBy('EventTimeAndDate', 'asc')
//      .limit(limitCount)
//      .get();
//
//    return eventsSnap.docs.map(doc => ({
//      id: doc.id,
//      ...doc.data(),
//    }));
//  } catch (error) {
//    console.error("Error fetching upcoming events:", error);
//    throw error; // Or return an empty array
//  }
//};

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
        const newEventRef = firestore().collection('Events').doc(); // Auto-generate ID
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

export const getUpcomingEvents = async (limitCount = 10) => {
  try {
    const now = firestore.Timestamp.now(); // Or Timestamp.fromDate(new Date())
    const eventsSnapshot = await firestore()
      .collection('Events') // Make sure this is your actual collection name
      .where('EventTimeAndDate', '>=', now) // Ensure 'EventTimeAndDate' is the correct field name in Firestore
      .orderBy('EventTimeAndDate', 'asc')   // Ensure 'EventTimeAndDate' is the correct field name in Firestore
      .limit(limitCount)
      .get();

    // Corrected console.log statements:
    console.log("Raw query snapshot size:", eventsSnapshot.size); // Use eventsSnapshot
    eventsSnapshot.docs.forEach(doc => {                         // Use eventsSnapshot
      console.log("Raw doc data:", doc.id, "=>", doc.data());
    });

    const events = eventsSnapshot.docs.map(doc => ({
      id: doc.id, ...doc.data(),
      // Ensure your UI expects 'title' and 'eventStartTimestamp' or adjust here/UI
      // If your Firestore uses 'EventName' and 'EventTimeAndDate', map them:
      // title: doc.data().EventName,
      // eventStartTimestamp: doc.data().EventTimeAndDate,
    }));

    console.log("Mapped events to be returned:", events); // Log 'events' after it's defined

    return events; // Return the mapped events
  } catch (error) {
    console.error("Error fetching upcoming events:", error.message, error.stack); // Log more error details
    throw error;
  }
};

const getEventDetails = async (eventId) => {
  if (!eventId) {
      console.error("Event ID is required.");
      throw new Error("Event ID is required.");
  }
  try {
    const eventDoc = await firestore().collection('Events').doc(eventId).get();
    if (!eventDoc.exists) {
      console.log('No such event!');
      return null;
    }
    return { id: eventDoc.id, ...eventDoc.data() };
  } catch (error) {
    console.error("Error fetching event details:", eventId, error);
    throw new Error("Couldn't fetch event details.")
  }
};

export const doesUserHaveTicketForEvent = async (userId, eventId) => {
   if (!userId || !eventId) throw new Error("User ID and Event ID are required.");
   try {
     const ticketQuery = await firestore()
     .collection('tickets') // <--- Use 'tickets'
     .where('userId', '==', userId)
     .where('eventId', '==', eventId)
     .limit(1)
     .get();
     return !ticketQuery.empty; // True if a ticket document exists
   } catch (error) {
      console.error("Error checking for existing ticket:", error);
      throw error;
   }
};

export const acquireTicketForEvent = async (eventId, ticketDetails = {}) => { // ticketDetails for future expansion
   const currentUser = auth().currentUser;
   if (!currentUser) throw new Error("User must be logged in to acquire a ticket.");

   const alreadyHasTicket = await doesUserHaveTicketForEvent(currentUser.uid, eventId);
   if (alreadyHasTicket) {
     throw new Error("You already have a ticket for this event.");
   }

   try {
     const ticketRef = firestore().collection('tickets').doc(); // <--- Use 'tickets', Auto ID
     const ticketData = {
        eventId,
        userId: currentUser.uid,
        acquiredAt: firestore.FieldValue.serverTimestamp(), // Or your preferred timestamp field name
        ...ticketDetails, // For any other ticket-specific info like type, price (if $0)
     };
     await ticketRef.set(ticketData);
     console.log("Ticket acquired for event:", eventId, "Ticket ID:", ticketRef.id);

     // Optionally, update the event with registered/ticket count
     await updateEventTicketCount(eventId, true);

     return { id: ticketRef.id, ...ticketData };
   } catch (error) {
      console.error("Error acquiring ticket:", error);
      throw error;
   }
};


const updateEventTicketCount = async (eventId, increment = true) => {
   const eventRef = firestore().collection('Events').doc(eventId);
   const fieldToUpdate = 'ticketHoldersCount'; // Or whatever you call it in your event docs

   try {
       await eventRef.update({
        [fieldToUpdate]: firestore.FieldValue.increment(increment ? 1 : -1)
       });
   } catch (error) {
     // If the field doesn't exist, set it to 1 (or 0 if decrementing from non-existent)
       if (error.code === 'firestore/not-found' || error.message.includes("No document to update")) {
         await eventRef.set({ [fieldToUpdate]: increment ? 1 : 0 }, { merge: true });
       } else if (error.message.includes("బుల్ కాదు")) { // Check for "value at 'field' is not a number"
         await eventRef.set({ [fieldToUpdate]: increment ? 1 : 0 }, { merge: true });
       }
       else {
         console.error("Error updating event ticket count:", error);
       }
   }
};


export const getTicketConfirmationDetails = async (ticketId) => {
  if (!ticketId) throw new Error("Ticket ID is required.");
  try {
    const ticketDoc = await firestore().collection('tickets').doc(ticketId).get(); // <--- Use 'tickets'
    if (!ticketDoc.exists) {
       console.log('No such ticket!');
       return null;
    }

    const ticketData = { id: ticketDoc.id, ...ticketDoc.data() };
    const eventDetails = await getEventDetails(ticketData.eventId); // Assumes getEventDetails is already defined

    return {
      ticket: ticketData,
      event: eventDetails,
    };
  } catch (error) {
     console.error("Error fetching ticket confirmation details:", error);
     throw error;
  }
};

export const getTicketAndEventDetails = async (ticketId) => {
  if (!ticketId) {
    throw new Error("Ticket ID is required.");
  }

  try {
    // 1. Get the ticket document
    const ticketDoc = await firestore().collection('tickets').doc(ticketId).get();
    if (!ticketDoc.exists) {
      throw new Error("Ticket not found.");
    }
    const ticketData = { id: ticketDoc.id, ...ticketDoc.data() };

    // 2. Get the eventId from the ticket data
    const eventId = ticketData.eventId;
    if (!eventId) {
      throw new Error("Event ID not found on the ticket.");
    }

    // 3. Get the corresponding event document
    const eventDoc = await firestore().collection('Events').doc(eventId).get();
    if (!eventDoc.exists) {
      throw new Error("Associated event not found.");
    }
    const eventData = { id: eventDoc.id, ...eventDoc.data() };

    // 4. Return both the ticket and the event data
    return {
      ticket: ticketData,
      event: eventData,
    };

  } catch (error) {
    console.error("Error fetching ticket and event details:", error);
    throw error; // Re-throw to be handled by the screen
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
  getEventDetails,
  doesUserHaveTicketForEvent,
  acquireTicketForEvent,
  updateEventTicketCount,
  getTicketConfirmationDetails,
};
