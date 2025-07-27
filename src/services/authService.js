// src/services/authService.js
import auth from '@react-native-firebase/auth';

// --- Common Auth Functions (Assumed placeholders or to be implemented) ---
const signIn = async (email, password) => {
  // Placeholder: Implement actual sign-in logic
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Auth Service - Sign In Error:", error.message);
    throw error; // Re-throw for component to handle
  }
};

const signOut = async () => {
  // Placeholder: Implement actual sign-out logic
  try {
    await auth().signOut();
  } catch (error) {
    console.error("Auth Service - Sign Out Error:", error.message);
    throw error;
  }
};

const getCurrentUser = () => {
  return auth().currentUser;
};
// --- End Common Auth Functions ---



// Sets a new password by first attempting to sign in with the new password,
const setNewPasswordBySpecificFlow = async (email, newPassword) => {
  try {
    const signInMethods = await auth().fetchSignInMethodsForEmail(email);
    if (!signInMethods || signInMethods.length === 0) {
      throw new Error('No user account found with this email address.');
    }

    // Attempt to sign in with the new password.
    // If this succeeds, the user's password is effectively changed.
    const userCredential = await auth().signInWithEmailAndPassword(email, newPassword);
    const user = userCredential.user;

    // The following updatePassword call is redundant if the signIn above succeeded
    // because the password is already 'newPassword'.
    // However, it's included to strictly match the original component's logic.
    // In a standard flow, this might indicate a misunderstanding of Firebase APIs.
    await user.updatePassword(newPassword);

    return 'Your password has been successfully updated.';
  } catch (error) {
    console.error("Auth Service - Set New Password Error:", error.code, error.message);
    if (error.code === 'auth/user-not-found') {
      throw new Error('No user account found with this email address.');
    } else if (error.code === 'auth/wrong-password') {
      // This error means the newPassword provided didn't match an existing password.
      // In the context of "setting" a new one, this could be confusing.
      // It implies an account exists, but the 'newPassword' isn't its current one.
      throw new Error('An authentication error occurred. Please try again.');
    } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many attempts. Please try again later.');
    } else if (error.code === 'auth/weak-password') {
        throw new Error('The new password is too weak. Please choose a stronger one.');
    }
    // Fallback error
    throw new Error(error.message || 'Failed to update password. Please try again.');
  }
};


export default {
  signIn,
  signOut,
  getCurrentUser,
  setNewPasswordBySpecificFlow,
};
