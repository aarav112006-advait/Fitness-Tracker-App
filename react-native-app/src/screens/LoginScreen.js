import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { globalStyles } from '../theme/styles';
import { AuthContext } from '../context/AuthContext';

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, quickDemoLogin, loading, authError } = useContext(AuthContext);

  const handleLogin = async () => {
    if (email && password) {
      await login(email, password);
    }
  };

  return (
    <View style={[globalStyles.container, styles.container]}>
      <View style={styles.brandBox}>
        <Text style={styles.brandLogo}>⚡ TRACKFIT</Text>
        <Text style={styles.brandSub}>Track Every Rep. Crush Every Goal.</Text>
      </View>

      {authError && <Text style={styles.errorText}>{authError}</Text>}

      <TextInput
        style={styles.input}
        placeholder="Athlete Email"
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={globalStyles.buttonPrimary} onPress={handleLogin} disabled={loading}>
        <Text style={globalStyles.buttonPrimaryText}>{loading ? 'Logging in...' : 'Sign In'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[globalStyles.buttonSecondary, { marginTop: 12 }]} onPress={quickDemoLogin}>
        <Text style={globalStyles.buttonSecondaryText}>Quick Athlete Demo Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.switchLink} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.switchText}>New here? <Text style={{ color: colors.primary }}>Create an Account</Text></Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandLogo: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 2,
  },
  brandSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 16,
    color: colors.textPrimary,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    fontSize: 15,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  switchLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});
