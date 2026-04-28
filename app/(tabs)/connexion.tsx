import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput } from "react-native";
import { signin } from "../../firebase/auth_signin_password";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Toast, useToast } from "@/components/toast";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Au moins 8 caractères, une majuscule, une minuscule, un chiffre
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function ConnexionScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { toast, show, hide } = useToast();

  const validateEmail = (value: string) => {
    if (!value) return "L'email est requis.";
    if (!EMAIL_REGEX.test(value)) return "Format d'email invalide.";
    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) return "Le mot de passe est requis.";
    if (!PASSWORD_REGEX.test(value))
      return "8 caractères min., avec une majuscule, une minuscule et un chiffre.";
    return "";
  };

  const handleSubmit = async () => {
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    try {
      await signin(email, password);
      show("Connexion réussie !", "success");
    } catch {
      show("Email ou mot de passe incorrect.", "error");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Toast {...toast} onHide={hide} />
      <ThemedText type="title">Connexion</ThemedText>

      <TextInput
        style={[styles.input, emailError ? styles.inputError : null]}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          setEmailError(validateEmail(v));
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      <TextInput
        style={[styles.input, passwordError ? styles.inputError : null]}
        placeholder="Mot de passe"
        placeholderTextColor="#888"
        value={password}
        onChangeText={(v) => {
          setPassword(v);
          setPasswordError(validatePassword(v));
        }}
        secureTextEntry
      />
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

      <Pressable style={styles.button} onPress={handleSubmit}>
        <ThemedText style={styles.buttonText}>Se connecter</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#e53935",
  },
  errorText: {
    color: "#e53935",
    fontSize: 12,
    marginTop: -8,
  },
  button: {
    backgroundColor: "#0a7ea4",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
