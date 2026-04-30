import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { signinAnonymously } from "../../firebase/auth_anonymous_signin";
import { signInWithFacebook } from "../../firebase/auth_facebook_signin_popup";
import { signinWithGithub } from "../../firebase/auth_github_signin_popup";
import { signinWithGoogle } from "../../firebase/auth_google_signin_popup";
import { signin } from "../../firebase/auth_signin_password";
import { sendSmsCode, verifySmsCode } from "../../firebase/auth_signin_phone";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Toast, useToast } from "@/components/toast";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

type Mode = "email" | "phone-step1" | "phone-step2";

export default function ConnexionScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [mode, setMode] = useState<Mode>("email");
  const [phone, setPhone] = useState("");
  const [phonemailErroror, setPhonemailErroror] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [smsError, setSmsError] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const webVerifierRef = useRef<any>(null);
  const { toast, show, hide } = useToast();
  const router = useRouter();

  // Initialise le reCAPTCHA visible dès l'entrée en mode téléphone
  useEffect(() => {
    if (mode === "phone-step1" && Platform.OS === "web") {
      (async () => {
        if (!webVerifierRef.current) {
          const { RecaptchaVerifier, getAuth } = await import("firebase/auth");
          webVerifierRef.current = new RecaptchaVerifier(
            getAuth(),
            "recaptcha-container",
            { size: "normal" },
          );
          await webVerifierRef.current.render();
        }
      })();
    }
    // Détruit le verifier quand on quitte le mode téléphone
    if (mode === "email" && webVerifierRef.current) {
      webVerifierRef.current.clear();
      webVerifierRef.current = null;
    }
  }, [mode]);

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

  const validatePhone = (value: string) => {
    if (!value) return "Le numéro est requis.";
    if (!PHONE_REGEX.test(value)) return "Format invalide. Ex: +33612345678";
    return "";
  };

  const handleEmailSubmit = async () => {
    const emailError = validateEmail(email);
    const phonemailErroror = validatePassword(password);
    setEmailError(emailError);
    setPasswordError(phonemailErroror);
    if (emailError || phonemailErroror) return;

    try {
      await signin(email, password);
      show("Connexion réussie !", "success");
      setTimeout(() => router.replace("/profil"), 1500);
    } catch {
      show("Email ou mot de passe incorrect.", "error");
    }
  };

  const handleGithubSubmit = async () => {
    try {
      await signinWithGithub();
      show("Connexion GitHub réussie !", "success");
      setTimeout(() => router.replace("/profil"), 1500);
    } catch {
      show("Erreur lors de la connexion GitHub.", "error");
    }
  };

  const handleGoogleSubmit = async () => {
    try {
      await signinWithGoogle();
      show("Connexion Google réussie !", "success");
      setTimeout(() => router.replace("/profil"), 1500);
    } catch {
      show("Erreur lors de la connexion Google.", "error");
    }
  };

  const handleFacebookSubmit = async () => {
    try {
      await signInWithFacebook();
      show("Connexion Facebook réussie !", "success");
      setTimeout(() => router.replace("/profil"), 1500);
    } catch {
      show("Erreur lors de la connexion Facebook.", "error");
    }
  };

  const handleAnonymousSubmit = async () => {
    try {
      await signinAnonymously();
      show("Connexion anonyme réussie !", "success");
      setTimeout(() => router.replace("/profil"), 1500);
    } catch {
      show("Erreur lors de la connexion anonyme.", "error");
    }
  };

  const handleSendCode = async () => {
    const phonemailErroror = validatePhone(phone);
    setPhonemailErroror(phonemailErroror);
    if (phonemailErroror) return;

    try {
      const appVerifier = webVerifierRef.current;
      const result = await sendSmsCode(phone, appVerifier);
      setConfirmationResult(result);
      setMode("phone-step2");
    } catch {
      if (webVerifierRef.current) {
        webVerifierRef.current.clear();
        webVerifierRef.current = null;
      }
      show("Impossible d'envoyer le SMS. Vérifiez le numéro.", "error");
    }
  };

  const handleVerifyCode = async () => {
    if (!smsCode || smsCode.length !== 6) {
      setSmsError("Le code doit contenir 6 chiffres.");
      return;
    }
    setSmsError("");

    try {
      await verifySmsCode(confirmationResult, smsCode);
      show("Connexion réussie !", "success");
      setTimeout(() => router.replace("/profil"), 1500);
    } catch {
      show("Code incorrect ou expiré.", "error");
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Toast {...toast} onHide={hide} />

      <ThemedText type="title">Connexion</ThemedText>

      {mode === "email" && (
        <>
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
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}

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
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}

          <Pressable style={styles.button} onPress={handleEmailSubmit}>
            <ThemedText style={styles.buttonText}>Se connecter</ThemedText>
          </Pressable>

          <Text style={styles.separator}>── ou ──</Text>

          <View style={styles.pillRow}>
            <Pressable
              style={[styles.pill, styles.phoneButton]}
              onPress={() => setMode("phone-step1")}
            >
              <FontAwesome name="phone" size={14} color="#fff" />
              <Text style={styles.pillText}>Téléphone</Text>
            </Pressable>

            <Pressable
              style={[styles.pill, styles.githubButton]}
              onPress={handleGithubSubmit}
            >
              <FontAwesome name="github" size={14} color="#fff" />
              <Text style={styles.pillText}>GitHub</Text>
            </Pressable>

            <Pressable
              style={[styles.pill, styles.googleButton]}
              onPress={handleGoogleSubmit}
            >
              <FontAwesome name="google" size={14} color="#4285F4" />
              <Text style={[styles.pillText, { color: "#3c4043" }]}>
                Google
              </Text>
            </Pressable>

            <Pressable
              style={[styles.pill, styles.facebookButton]}
              onPress={handleFacebookSubmit}
            >
              <FontAwesome name="facebook" size={14} color="#fff" />
              <Text style={styles.pillText}>Facebook</Text>
            </Pressable>

            <Pressable
              style={[styles.pill, styles.anonymousButton]}
              onPress={handleAnonymousSubmit}
            >
              <FontAwesome name="user-secret" size={14} color="#fff" />
              <Text style={styles.pillText}>Anonyme</Text>
            </Pressable>
          </View>
        </>
      )}

      {mode === "phone-step1" && (
        <>
          <TextInput
            style={[styles.input, phonemailErroror ? styles.inputError : null]}
            placeholder="Numéro de téléphone (ex: +33612345678)"
            placeholderTextColor="#888"
            value={phone}
            onChangeText={(v) => {
              setPhone(v);
              setPhonemailErroror(validatePhone(v));
            }}
            keyboardType="phone-pad"
            autoCapitalize="none"
          />
          {phonemailErroror ? (
            <Text style={styles.errorText}>{phonemailErroror}</Text>
          ) : null}

          {/* Widget reCAPTCHA visible — l'utilisateur coche "Je ne suis pas un robot" */}
          {Platform.OS === "web" && (
            <View nativeID="recaptcha-container" style={styles.recaptcha} />
          )}

          <Pressable style={styles.button} onPress={handleSendCode}>
            <ThemedText style={styles.buttonText}>Envoyer le code</ThemedText>
          </Pressable>

          <Pressable onPress={() => setMode("email")}>
            <Text style={styles.link}>← Retour</Text>
          </Pressable>
        </>
      )}

      {mode === "phone-step2" && (
        <>
          <Text style={styles.hint}>Code envoyé au {phone}</Text>

          <TextInput
            style={[styles.input, smsError ? styles.inputError : null]}
            placeholder="Code à 6 chiffres"
            placeholderTextColor="#888"
            value={smsCode}
            onChangeText={(v) => {
              setSmsCode(v);
              setSmsError("");
            }}
            keyboardType="number-pad"
            maxLength={6}
          />
          {smsError ? <Text style={styles.errorText}>{smsError}</Text> : null}

          <Pressable style={styles.button} onPress={handleVerifyCode}>
            <ThemedText style={styles.buttonText}>Vérifier</ThemedText>
          </Pressable>

          <Pressable onPress={() => setMode("phone-step1")}>
            <Text style={styles.link}>← Retour</Text>
          </Pressable>
        </>
      )}
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
  recaptcha: {
    alignItems: "flex-start",
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
  buttonOutline: {
    borderWidth: 1.5,
    borderColor: "#0a7ea4",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonOutlineText: {
    color: "#0a7ea4",
    fontWeight: "600",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  pillText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  phoneButton: {
    backgroundColor: "#25D366",
  },
  githubButton: {
    backgroundColor: "#24292e",
  },
  googleButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dadce0",
  },
  facebookButton: {
    backgroundColor: "#1877F2",
  },
  anonymousButton: {
    backgroundColor: "#6c757d",
  },
  separator: {
    textAlign: "center",
    color: "#888",
    fontSize: 13,
  },
  link: {
    color: "#0a7ea4",
    fontSize: 14,
    textAlign: "center",
  },
  hint: {
    color: "#555",
    fontSize: 14,
    textAlign: "center",
  },
});
