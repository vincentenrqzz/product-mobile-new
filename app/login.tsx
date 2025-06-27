import { useAuth } from "@/screens/contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// Dismiss keyboard when tapping outside
const dismissKeyboard = () => {
  Keyboard.dismiss();
};

const Login = () => {
  const [envState, setEnvState] = useState("DEV");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { handleLogin, loginState, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    const loadEnvState = async () => {
      try {
        const storedEnv = await AsyncStorage.getItem("envState");
        if (storedEnv) {
          setEnvState(storedEnv);
        }
      } catch (error) {
        console.log("Error loading envState from AsyncStorage", error);
      }
    };

    loadEnvState();
  }, []);

  useEffect(() => {
    console.log("Login screen - isAuthenticated:", isAuthenticated);
    console.log("Login screen - isLoading:", isLoading);
  }, [isAuthenticated, isLoading]);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  const handleEnvSelection = async (env: string) => {
    try {
      setEnvState(env);
      await AsyncStorage.setItem("envState", env);
    } catch (error) {
      console.log("Error saving envState to AsyncStorage", error);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <Text style={styles.title}>Finito</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={username}
          onChangeText={setUsername}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loginState.isPending}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loginState.isPending}
        />

        {loginState.isError && (
          <Text style={styles.errorText}>
            {loginState.error?.message || "Login failed. Please try again."}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.button, loginState.isPending && styles.buttonDisabled]}
          onPress={() => handleLogin(username, password, false)}
          disabled={loginState.isPending}
        >
          {loginState.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
});

export default Login;
