# Backend Functions Documentation
This file documents the backend-related functions and logic used in the app for future reference.

the file currently doesnt include bottomtabnavigator, home screen, events or sidebar as they are still in the work.

it also does not inclufe chat, events, explore as they are currently place holders/hasnt been worked on yet.
---

## Interest Selection Screen

**File:** `InterestSelectionScreen.js`
**Purpose:** Allows users to select their interests (fetched from Firestore) before signing up.

### Functions

#### 1. Fetch Interests from Firestore
```js
useEffect(() => {
  const fetchInterests = async () => {
    try {
      const snapshot = await firestore().collection('Interests').get();
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().NameOfInterests
      }));
      setInterests(list);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  fetchInterests();
}, []);

Description: Retrieves all available interests from the Interests Firestore collection.

Returns: An array of objects { id, name } representing each interest.

Notes: Firestore must have a field named NameOfInterests.
```

#### 2. Toggle Interest Selection
```js

const toggleInterest = (id) => {
  setSelected(prev =>
    prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
  );
};

Description: Adds/removes an interest ID from the selected array when the user taps it.

Input: id → Firestore document ID of the interest.

Output: Updates the selected state.

```

#### 3. Handle Next (Proceed to Sign-up)
```js
const handleNext = () => {
  if (selected.length === 0) {
    Alert.alert('Please select at least one interest');
    return;
  }
  navigation.navigate('SignUp', { selectedInterests: selected });
};

Description: Checks if the user selected at least one interest, then navigates to the SignUp screen.

Input: selected → array of interest IDs chosen by the user.

Output: Passes selectedInterests to the next screen.
```

## Sign Up Screen

**File:** `SignUpScreen.js`
**Purpose:** Handles new user registration, validates input, creates an account in Firebase Auth, and stores user profile data in Firestore.

### Functions

#### 1. Validate Password
```js
const validatePassword = (pwd, confirmPwd) => {
  const validations = {
    length: pwd.length > 8,
    digit: /\d/.test(pwd),
    capital: /[A-Z]/.test(pwd),
    special: /[^A-Za-z0-9]/.test(pwd),
    match: pwd === confirmPwd,
  };
  setValidation(validations);
  return Object.values(validations).every(Boolean);
};

Description: Checks if the password meets security requirements.

Rules Enforced:

Minimum length > 8 characters

At least one digit

At least one uppercase letter

At least one special character

Matches the confirm password field

Returns: true if all rules pass, otherwise false.
```

#### 2. Handle Sign Up
```js
const handleSignUp = async () => {
  // validation + user creation + Firestore
};

Description: Registers a new user in Firebase Authentication and stores their profile in Firestore.

Steps Performed:

1. Validates all required inputs (name, email, phone, password).

2. Enforces email format (must be Gmail address).

3. Validates Saudi phone numbers (must start with 5 and be 9 digits).

4. Validates password with validatePassword.

5. Creates a Firebase Auth user (auth().createUserWithEmailAndPassword).

6. Stores user info in Firestore under the Users collection:
{
  FullName: "User’s full name",
  Email: "user@gmail.com",
  Phone: "+9665xxxxxxx",
  Interests: [selectedInterests],
  CreatedAt: serverTimestamp()
}

7. Sends email verification and signs the user out.

8. Navigates to the Verification screen with the email passed as a parameter.

9. Error Handling: Displays alert messages if validation fails or Firebase throws an error.
```

#### 3. get indicator
```js

const getIndicator = (condition, text) => (
  <Text style={{ color: condition ? 'green' : 'red' }}>
    {condition ? '✅' : '❌'} {text}
  </Text>
);
Description: Displays a ✅ (green) or ❌ (red) depending on whether a password requirement is met.

Inputs:

condition → Boolean value

text → The requirement description (e.g., "Password Length > 8")

Output: A styled Text element.

```
#### Summary
```js
This screen ensures user credentials are valid, creates a secure account in Firebase Authentication, saves the user’s profile and selected interests in Firestore, and requires email verification before login.
```
---

## Verification Screen

**File:** `Verification.js`
**Purpose:** Confirms whether the user has verified their email after signing up. Provides a button to continue once verified.

### Functions

#### 1. Handle Continue
```js
const handleContinue = async () => {
  const user = auth().currentUser;
  await user.reload(); // Refresh user data

  if (user.emailVerified) {
    Alert.alert('Success', 'Email verified!');
    navigation.navigate('Login');
  } else {
    Alert.alert('Not Verified', 'Please verify your email before continuing.');
  }
};
Description: Reloads the current Firebase Auth user and checks if their email is verified.

Steps Performed:

1. Reloads user object (user.reload()) to get the latest status.

2. If user.emailVerified === true, shows success alert and navigates to Login.

3. Otherwise, alerts user that verification hasn’t been completed.
```

#### 2. (Optional) 4-Digit Code Verification (Commented Out)
```js

// Example structure:
const handleVerify = async () => {
  const fullCode = code.join('');
  if (fullCode.length !== 4) {
    Alert.alert('Error', 'Enter the full 4-digit code.');
    return;
  }

  const doc = await firestore().collection('PasswordResetCodes').doc(email).get();
  if (!doc.exists || doc.data().code !== fullCode) {
    Alert.alert('Invalid Code', 'Incorrect or expired code.');
    return;
  }

  await firestore().collection('PasswordResetCodes').doc(email).delete();
  navigation.navigate('ResetPassword', { email });
};

Description: (Currently commented out)
Provides an alternate 4-digit verification method using Firestore.

Process:

1. Collects a 4-digit code from the user.

2. Compares it against the saved code in PasswordResetCodes collection.

3. Deletes the code if valid and navigates user to ResetPassword screen.

Use Case: Could be adapted for password reset flows.

```
#### Summary
```js
1. The main verification flow relies on Firebase email verification links.
2. A 4-digit code system is scaffolded in comments but not currently in use.
3. Ensures users cannot proceed to login until verification is confirmed.
```

---

## Login Screen

**File:** `LoginScreen.js`
**Purpose:** Allows users to log in with email and password, toggle password visibility, and navigate to other screens (Sign Up / Forgot Password).

### Functions

#### 1. Handle Login
```js
const handleLogin = async () => {
  if (!email || !password) {
    Alert.alert('Error', 'Please enter both email and password');
    return;
  }

  setIsLoading(true);
  try {
    const user = await authService.signIn(email, password);

    if (user) {
      Alert.alert('Success', 'You are now logged in!');
      navigation.navigate('MainApp');
    }
  } catch (error) {
    Alert.alert('Login Error', error.message || 'An unexpected error occurred.');
  } finally {
    setIsLoading(false);
  }
};
Description: Handles the user login process with input validation and Firebase authentication through authService.

Steps Performed:

1. Validates input (ensures both email and password are entered).
2. Calls authService.signIn(email, password) to authenticate.
3. On success, alerts the user and navigates to MainApp.
4. On failure, shows an error alert.
5. Disables login button while request is in progress (isLoading).
```
#### 2. Toggle Password Visibility
```js
<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
  <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} />
</TouchableOpacity>

Description: Allows users to show or hide their password input.

Logic:
When showPassword is true → password is visible, icon switches to eye-off.
When false → password is hidden, icon shows eye-outline.
```

#### 3. Navigation Helpers
```js
- sign up navigation
onPress={() => navigation.navigate('SignUp')}
Navigates users to the Sign Up screen.

- forgot password navigation
onPress={() => navigation.navigate('ForgotPasswordEmail')}
Redirects users to the Forgot Password flow.

```
#### Summary
```js
1. Provides secure login with Firebase through authService.
2. Enhances UX with password toggle and loading state.
3. Easy navigation between Login, Sign Up, and Forgot Password screens.
```
---

## Reset Password Screen

**File:** `ResetPassword.js`
**Purpose:** Allows the user to set a new password after verification. Validates inputs, ensures both fields match, and updates the password in Firestore.

---

### Functions

#### 1. Handle Reset Password
```js
const handleResetPassword = async () => {
  if (!newPassword.trim() || !confirmPassword.trim()) {
    Alert.alert('Error', 'Please fill in both fields.');
    return;
  }

  if (newPassword !== confirmPassword) {
    Alert.alert('Error', 'Passwords do not match.');
    return;
  }

  try {
    await firestore()
      .collection('Users')
      .doc(email)
      .update({ Password: newPassword });

    Alert.alert('Success', 'Password has been reset successfully!');
    navigation.navigate('Login');
  } catch (error) {
    Alert.alert('Error', error.message || 'Something went wrong.');
  }
};
Description:
Validates new password input, checks for a match between the two fields, and updates the password in Firestore if all conditions are met.

Steps Performed:

Ensures both New Password and Confirm Password fields are filled.

Compares the two fields → if they don’t match, show error.

If valid, update the Password field in Firestore for the user’s email.

Show success alert on completion.

Navigate user back to Login screen.
```
#### 2. Extra UI Feature: Back to Login
```js
<TouchableOpacity
  style={styles.backButton}
  onPress={() => navigation.navigate('Login')}
>
  <Text style={styles.backButtonText}>Back to Login</Text>
</TouchableOpacity>

Description:
Provides the user with a quick way to abandon the reset process and return to the Login screen.
```
#### Summary
```js
1. User enters a new password and confirmation password.
2. Both fields are validated (non-empty + must match).
3. If valid, Firestore updates the user’s password.
4. User receives a success message.
5. User is redirected to the Login screen.
6. Option available to return to Login without resetting.

```

---
## Forgot Password Email Screen

**File:** `ForgotPasswordEmail.js`
**Purpose:** Starts the password reset process by validating the user’s email, generating a 4-digit code, storing it in Firestore, and navigating to the verification screen.

---

### Functions

#### 1. Generate Code
```js
const generateCode = () =>
  Math.floor(1000 + Math.random() * 9000).toString();

Description:
Creates a random 4-digit numeric code as a string. Used for password reset verification.

Steps Performed:

1. Generates a random number between 1000–9999.

2. Converts it to a string for consistency.

```
#### 2. Handle Send Code
```js
const handleSendCode = async () => {
  if (!email.trim()) {
    Alert.alert('Error', 'Please enter your email.');
    return;
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const userSnapshot = await firestore()
      .collection('Users')
      .where('Email', '==', cleanEmail)
      .get();

    if (userSnapshot.empty) {
      Alert.alert('Error', 'No user found with this email.');
      return;
    }

    const code = generateCode();

    await firestore()
      .collection('PasswordResetCodes')
      .doc(cleanEmail)
      .set({
        code,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

    Alert.alert(
      'Code Sent',
      `A 4-digit code has been sent to ${cleanEmail} (simulated).`
    );

    navigation.navigate('Verification', { email: cleanEmail });
  } catch (error) {
    Alert.alert('Error', error.message || 'Something went wrong.');
  }
};
Description:
Validates the entered email, checks Firestore for an existing user, generates a reset code, saves it, and moves the user to the verification step.

Steps Performed:

1. Validates that an email was entered.

2. Normalizes input (trim + lowercase).

3. Queries Firestore Users collection for a match.

4. If no user exists → show error alert.

5. If user exists → generate 4-digit code.

6. Save code to Firestore in PasswordResetCodes with timestamp.

7. Show success alert to user.

8. Navigate to Verification screen with email parameter.

```
#### 3. Extra UI Feature: Back to Login
```js
<TouchableOpacity
  style={styles.backButton}
  onPress={() => navigation.navigate('Login')}
>
  <Text style={styles.backButtonText}>Back to Login</Text>
</TouchableOpacity>

Description:
Provides a quick navigation option for the user to return to the Login screen instead of continuing with password reset.
```
##### Summary
```js
1. User enters their email.
2. System checks Firestore for a matching account.
3. If found, a 4-digit code is generated and stored.
4. User is alerted that the code has been sent (simulated).
5. Navigation continues to Verification screen.
6. User also has option to return to Login scre
```
---
## Authentication Service

**File:** `src/services/authService.js`
**Purpose:** Centralized service handling Firebase Authentication actions like sign-in, sign-out, user retrieval, and password updates. Provides reusable functions for auth-related logic across the app.

---

### Functions

#### 1. Sign In
```js
const signIn = async (email, password) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Auth Service - Sign In Error:", error.message);
    throw error;
  }
};

Description:
Authenticates a user using Firebase Authentication with their email and password.

Steps Performed:

1. Attempts to sign in via auth().signInWithEmailAndPassword.

2. If successful → returns the authenticated user object.

3. If failed → logs error and re-throws for component handling.
```
#### 2. Sign Out
```js
const signOut = async () => {
  try {
    await auth().signOut();
  } catch (error) {
    console.error("Auth Service - Sign Out Error:", error.message);
    throw error;
  }
};

Description:
Logs out the currently authenticated user from Firebase.

Steps Performed:

1. Calls auth().signOut() to clear session.

2. If error occurs → logs and re-throws.

```
#### 3. Get Current User
```js
const getCurrentUser = () => {
  return auth().currentUser;
};

Description:
Fetches the currently signed-in Firebase user object.
Use Case: Useful for quick checks (e.g., whether a user is logged in).
```

#### 4. Set New Password by Specific Flow
```js
const setNewPasswordBySpecificFlow = async (email, newPassword) => {
  try {
    const signInMethods = await auth().fetchSignInMethodsForEmail(email);
    if (!signInMethods || signInMethods.length === 0) {
      throw new Error('No user account found with this email address.');
    }

    const userCredential = await auth().signInWithEmailAndPassword(email, newPassword);
    const user = userCredential.user;

    await user.updatePassword(newPassword);

    return 'Your password has been successfully updated.';
  } catch (error) {
    console.error("Auth Service - Set New Password Error:", error.code, error.message);
    if (error.code === 'auth/user-not-found') {
      throw new Error('No user account found with this email address.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('An authentication error occurred. Please try again.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many attempts. Please try again later.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('The new password is too weak. Please choose a stronger one.');
    }
    throw new Error(error.message || 'Failed to update password. Please try again.');
  }
};

Description:
Implements a custom password update flow by signing in with the new password and updating the Firebase account password.

⚠️ Note: This logic is unusual because normally you update the password while authenticated, not by re-signing in with the new password. The redundant updatePassword() is included for consistency with original logic.

Steps Performed:

1. Checks if email exists via fetchSignInMethodsForEmail.
2. If no account → throws error.
3. Attempts sign-in with the newPassword.
4. If successful, password is effectively changed.
5. Calls user.updatePassword(newPassword) (redundant, but included).
6. Handles errors (user-not-found, wrong-password, too-many-requests, weak-password).
7. Returns a success message on completion.
```

#### Summary
```js
1. signIn → Authenticates a user with email & password.
2. signOut → Logs out the user.
3. getCurrentUser → Retrieves the current user object.
4. setNewPasswordBySpecificFlow → Implements a custom password reset flow with extra validation.
```
----

## Firestore Service

**File:** `src/services/firestoreService.js`
**Purpose:** Purpose: Provides utility functions to fetch user data, interests, events, and discussions from Firestore.

---

### Functions

#### 1. Get User Full Name
```js
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
    throw error;
  }
};

Description:
Fetches the full name of a user from the Users collection by their userId.

Steps Performed:
1. Validates that userId is provided.
2. Retrieves the document from the Users collection.
3. Returns the FullName field if it exists, otherwise returns null.
4. Logs and re-throws any errors.
```

#### 2. Get Interest
```js
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
    throw error;
  }
};

Description:
Retrieves all available interests from the interests collection.

Steps Performed:

1. Fetches all documents from interests.
2. Maps each interest id to its name.
3. Returns the constructed map of interests.
4. Logs and re-throws errors if encountered.
```
#### 3. Upcoming Events
```js
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
    throw error;
  }
};

Description:
Fetches a limited number of upcoming events starting from today.

Steps Performed:
1. Sets today’s date at midnight to filter future events.
2. Queries the Events collection where EventTimeAndDate is greater than or equal to today.
3. Sorts results by event date in ascending order.
4. Limits results to limitCount (default 2).
5. Maps each document to include its id and data.
```
#### 4. Get Latest Discussions
```js
const getLatestDiscussions = async (limitCount = 3) => {
  try {
    const discussionsSnap = await firestore()
      .collection('discussions')
      .orderBy('createdAt', 'desc')
      .limit(limitCount)
      .get();

    return discussionsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching latest discussions:", error);
    throw error;
  }
};

Description:
Fetches the latest discussions, ordered by creation date.

Steps Performed:
1. Queries the discussions collection.
2. Orders results by createdAt in descending order.
3. Limits results to limitCount (default 3).
4. Maps each document to include its id and data.
```

#### Summary
```js
1. `getUserFullName` → Retrieves user’s full name by ID from `Users`.
2. `getInterests` → Fetches all interests and returns as a map of `{id: name}`.
3. `getUpcomingEvents` → Gets upcoming events starting today, sorted by date.
4. `getLatestDiscussions` → Retrieves latest discussions ordered by creation time.
```