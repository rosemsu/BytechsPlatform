// Importing required modules and components
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet,
} from 'react-native';
import auth from '@react-native-firebase/auth'; // Firebase authentication module
import Icon from 'react-native-vector-icons/Ionicons'; // Icons for UI

// Login screen component definition
const LoginScreen = ({ navigation }) => {
  // State hooks for user inputs and password visibility
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Function to handle login process
  const handleLogin = async () => {
    // Basic input validation
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      // Sign in using Firebase auth
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Check if user's email is verified
      if (!user.emailVerified) {
        await auth().signOut(); // Sign out unverified users
        Alert.alert('Email Not Verified', 'Please verify your email first.');
        return;
      }

      Alert.alert('Success', 'You are now logged in!');
      navigation.navigate('MainApp'); // Navigate to main app screen
    } catch (error) {
      // Display login errors
      Alert.alert('Login Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to ByTechs</Text>

      {/* Login/Signup tab header */}
      <View style={styles.tabRow}>
        <View style={[styles.tabButton, styles.activeTab]}>
          <Text style={styles.activeText}>Login</Text>
        </View>
        <TouchableOpacity
          style={[styles.tabButton, styles.inactiveTab]}
          onPress={() => navigation.navigate('SignUp')}
        >
          <Text style={styles.inactiveText}>Sign up</Text>
        </TouchableOpacity>
      </View>

      {/* Email input field */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      {/* Password input field with show/hide toggle */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1, borderWidth: 0 }]}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} />
        </TouchableOpacity>
      </View>

      {/* Forgot password link */}
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPasswordEmail')}>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Login button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles for the login screen components
const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
    backgroundColor: '#fff',
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
    marginRight: 10,
  },
  inactiveTab: {
    backgroundColor: '#eee',
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
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  forgotPassword: {
    color: '#5c4dd2',
    textAlign: 'right',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#5c4dd2',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

// Export component
export default LoginScreen;
