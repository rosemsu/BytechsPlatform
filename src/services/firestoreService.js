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

export default {
  getUserFullName,
  getInterests,
  getUpcomingEvents,
  getLatestDiscussions,
};
