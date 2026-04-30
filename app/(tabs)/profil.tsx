import { useRouter } from "expo-router";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { signout } from "../../firebase/auth_signout";
import "../../firebaseConfig";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Toast, useToast } from "@/components/toast";

export default function ProfilScreen() {
  const router = useRouter();
  const { toast, show, hide } = useToast();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (u) => setUser(u));
    return unsubscribe;
  }, []);

  const handleSignout = async () => {
    try {
      await signout();
      show("Déconnexion réussie !", "success");
      setTimeout(() => router.replace("/connexion"), 1500);
    } catch {
      show("Erreur lors de la déconnexion.", "error");
    }
  };

  const isLoggedIn = !!user;

  return (
    <ThemedView style={styles.container}>
      <Toast {...toast} onHide={hide} />

      <ThemedText type="title">Profil</ThemedText>

      {user?.displayName ? (
        <ThemedText style={styles.greeting}>Bonjour {user.displayName} 👋</ThemedText>
      ) : null}

      <ThemedText style={styles.text}>
        Ici s&apos;affichera prochainement votre profil
      </ThemedText>

      {!isLoggedIn && (
        <Text style={styles.warning}>
          Vous n&apos;êtes actuellement pas connecté
        </Text>
      )}

      <Pressable
        style={[styles.button, !isLoggedIn && styles.buttonDisabled]}
        onPress={handleSignout}
        disabled={!isLoggedIn}
      >
        <ThemedText style={styles.buttonText}>Se déconnecter</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
    gap: 24,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
  warning: {
    color: "#e53935",
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
  },
  button: {
    backgroundColor: "#e53935",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: "#aaa",
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
