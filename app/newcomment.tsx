import { useLocalSearchParams, useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { useState } from "react";
import { addComment } from "../firebase/add_comment_data";
import "../firebaseConfig";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Toast, useToast } from "@/components/toast";

export default function NewCommentScreen() {
  const router = useRouter();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { toast, show, hide } = useToast();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const user = getAuth().currentUser;

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <Toast {...toast} onHide={hide} />
        <ThemedText type="title">Nouveau commentaire</ThemedText>
        <Text style={styles.warning}>Vous devez être connecté pour commenter.</Text>
        <Pressable style={styles.button} onPress={() => router.replace("/connexion")}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </Pressable>
      </ThemedView>
    );
  }

  const handleSubmit = async () => {
    if (!text.trim()) {
      show("Veuillez écrire un commentaire.", "error");
      return;
    }
    setLoading(true);
    try {
      await addComment(postId, text.trim(), user.displayName ?? user.email);
      show("Commentaire ajouté !", "success");
      setTimeout(() => router.back(), 1500);
    } catch (e: any) {
      show(`Erreur : ${e?.message ?? "inconnue"}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Toast {...toast} onHide={hide} />

      <ThemedText type="title">Nouveau commentaire</ThemedText>

      <Text style={styles.label}>Commentaire</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        value={text}
        onChangeText={setText}
        placeholder="Votre commentaire..."
        multiline
        numberOfLines={5}
      />

      <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Envoi..." : "Publier"}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 40,
    paddingBottom: 40,
    gap: 12,
  },
  label: {
    fontWeight: "600",
    color: "#555",
    marginBottom: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: "#fff",
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#1565c0",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  warning: {
    color: "#e53935",
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
  },
});
