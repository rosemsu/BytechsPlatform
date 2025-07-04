import auth from '@react-native-firebase/auth';
import { Alert } from 'react-native'; // Keep Alert for user feedback here or pass messages back

const signIn = async (email, password) => {
  if (!email || !password) {
    // It's often better to handle UI alerts in the component,
    // but for simplicity in this example, it's here.
    // Consider returning an error object instead.
    Alert.alert('Error', 'Please enter both email and password');
    return null; // Or throw an error
  }

  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      await auth().signOut();
      Alert.alert('Email Not Verified', 'Please verify your email first.');
      return null; // Or throw an error indicating email not verified
    }
    return user; // Return the user object on success
  } catch (error) {
    Alert.alert('Login Error', error.message);
    return null; // Or throw the error
  }
};

const signOut = async () => {
  try {
    await auth().signOut();
  } catch (error) {
    console.error("Error signing out: ", error);
    // Handle sign-out error appropriately
  }
};

// Add other auth functions here (signUp, sendPasswordResetEmail, etc.)
// e.g.,
// const signUp = async (email, password) => { ... };
// const sendPasswordResetEmail = async (email) => { ... };

export default {
  signIn,
  signOut,
  // signUp,
  // sendPasswordResetEmail,
};
