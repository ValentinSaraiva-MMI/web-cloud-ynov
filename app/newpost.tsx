import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { createPost } from "../firebase/add_post_data";
import "../firebaseConfig";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Toast, useToast } from "@/components/toast";

export default function NewPostScreen() {
  const router = useRouter();
  const { toast, show, hide } = useToast();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const user = getAuth().currentUser;

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <Toast {...toast} onHide={hide} />
        <ThemedText type="title">Nouveau post</ThemedText>
        <Text style={styles.warning}>Vous devez être connecté pour créer un post.</Text>
        <Pressable style={styles.button} onPress={() => router.replace("/connexion")}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </Pressable>
      </ThemedView>
    );
  }

  const handleSubmit = async () => {
    if (!title.trim() || !text.trim()) {
      show("Veuillez remplir tous les champs.", "error");
      return;
    }
    setLoading(true);
    try {
      await createPost(title.trim(), text.trim(), user.displayName ?? user.email);
      show("Post créé !", "success");
      setTimeout(() => router.replace("/"), 1500);
    } catch (e: any) {
      show(`Erreur : ${e?.message ?? "inconnue"}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Toast {...toast} onHide={hide} />

      <ThemedText type="title">Nouveau post</ThemedText>

      <Text style={styles.label}>Titre</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Titre du post"
      />

      <Text style={styles.label}>Contenu</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        value={text}
        onChangeText={setText}
        placeholder="Contenu du post"
        multiline
        numberOfLines={6}
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
    minHeight: 120,
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
