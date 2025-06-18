// Importing required modules and components
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth'; // Firebase Authentication
import firestore from '@react-native-firebase/firestore'; // Firebase Firestore
import Icon from 'react-native-vector-icons/Ionicons'; // Icon library
import CountryPicker from 'react-native-country-picker-modal'; // Country code picker

// Signup  screen component definition
const SignUpScreen = ({ navigation, route }) => {
  // Get selected interests passed from InterestSelectionScreen
  const selectedInterests = route?.params?.selectedInterests || [];

  // Form state variables
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode] = useState('SA');
  const [callingCode] = useState('966');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // State for tracking password validation
  const [validation, setValidation] = useState({
    length: false,
    digit: false,
    capital: false,
    special: false,
    match: false,
  });

  // Function to validate password rules
  const validatePassword = (pwd, confirmPwd) => {
    const validations = {
      length: pwd.length > 8,
      digit: /\d/.test(pwd),
      capital: /[A-Z]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
      match: pwd === confirmPwd,
    };
    setValidation(validations);
    return Object.values(validations).every(Boolean); // true only if all conditions are met
  };

  // Handles user registration
  const handleSignUp = async () => {
    // Input validation
    if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    // Only allow Gmail addresses (we need to check if we should keep it this way cause im not sure why we only allow @gmail)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid Gmail address.');
      return;
    }

    // Validate Saudi phone number format (e.g. 512345678)
    const saPhoneRegex = /^[5][0-9]{8}$/;
    if (!saPhoneRegex.test(phoneNumber)) {
      Alert.alert('Invalid Phone Number', 'Enter a valid Saudi number (e.g., 512345678).');
      return;
    }

    // Check if password meets requirements
    const isValid = validatePassword(password, confirmPassword);
    if (!isValid) {
      Alert.alert('Invalid Password', 'Please meet all password requirements.');
      return;
    }

    try {
      // Create user with Firebase Auth
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Save user profile in Firestore
      await firestore().collection('Users').doc(user.uid).set({
        FullName: fullName,
        Email: user.email,
        Phone: `+${callingCode}${phoneNumber}`,
        Interests: selectedInterests,
        CreatedAt: firestore.FieldValue.serverTimestamp(),
      });

      // Send email verification and sign out the user
      await auth().currentUser.sendEmailVerification();
      await auth().signOut();

      // Navigate to Verification screen
      navigation.navigate('Verification', { email });
    } catch (error) {
      Alert.alert('Sign Up Error', error.message);
    }
  };

  // Renders a validation checkmark for password requirements
  const getIndicator = (condition, text) => (
    <Text style={{ color: condition ? 'green' : 'red' }}>
      {condition ? '✅' : '❌'} {text}
    </Text>
  );

  // JSX rendering of the sign-up form
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome to ByTechs</Text>

      {/* Tab Row: Login vs Signup */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, styles.inactiveTab]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.inactiveText}>Login</Text>
        </TouchableOpacity>
        <View style={[styles.tabButton, styles.activeTab]}>
          <Text style={styles.activeText}>Sign up</Text>
        </View>
      </View>

      {/* Form Inputs */}
      <TextInput
        style={styles.input}
        placeholder="Full name"
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        style={styles.input}
        placeholder="Gmail Address"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {/* Phone input with fixed country code */}
      <View style={styles.phoneWrapper}>
        <CountryPicker
          countryCode="SA"
          withFilter={false}
          withFlag
          withCallingCode
          withEmoji
          onSelect={() => {}}
          containerButtonStyle={styles.countryPicker}
        />
        <Text style={styles.plus}>+966</Text>
        <TextInput
          style={styles.phoneInput}
          placeholder="Phone number"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />
      </View>

      {/* Password field with visibility toggle */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, styles.inputNoBorder, { flex: 1 }]}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            validatePassword(text, confirmPassword);
          }}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} />
        </TouchableOpacity>
      </View>

      {/* Confirm password input */}
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          validatePassword(password, text);
        }}
      />

      {/* Password requirement indicators */}
      <View style={styles.validationContainer}>
        {getIndicator(validation.length, 'Password Length > 8')}
        {getIndicator(validation.digit, 'At least 1 digit')}
        {getIndicator(validation.capital, 'At least 1 capital letter')}
        {getIndicator(validation.special, 'At least 1 special character')}
        {getIndicator(validation.match, 'Password matches confirm password')}
      </View>

      {/* Sign up button */}
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign up</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Styles for the sign up screen components
const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    color: '#0b0b38',
    marginBottom: 20,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#5c4dd2',
  },
  inactiveTab: {
    backgroundColor: '#eee',
    marginRight: 10,
  },
  activeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inactiveText: {
    color: '#5c4dd2',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  inputNoBorder: {
    borderWidth: 0,
  },
  phoneWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  countryPicker: {
    marginRight: 5,
  },
  plus: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  phoneInput: {
    flex: 1,
    height: 40,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  validationContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#5c4dd2',
    paddingVertical: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
});

// Export component
export default SignUpScreen;
