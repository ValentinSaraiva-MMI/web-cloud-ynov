import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { createPost } from "../firebase/add_post_data";
import { uploadToFirebase } from "../firebase/storage_upload_file";
import "../firebaseConfig";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Toast, useToast } from "@/components/toast";

export default function NewPostScreen() {
  const router = useRouter();
  const { toast, show, hide } = useToast();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !text.trim()) {
      show("Veuillez remplir tous les champs.", "error");
      return;
    }
    setLoading(true);
    try {
      let imageUrl: string | null = null;
      if (imageUri) {
        const fileName = `post_${Date.now()}_${imageUri.split("/").pop()}`;
        imageUrl = await uploadToFirebase(imageUri, fileName);
      }
      await createPost(title.trim(), text.trim(), user.displayName ?? user.email, imageUrl, user.uid);
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

      <Text style={styles.label}>Image (optionnel)</Text>
      <Pressable style={styles.imagePicker} onPress={pickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>Appuyer pour choisir une image</Text>
          </View>
        )}
      </Pressable>
      {imageUri && (
        <Pressable onPress={() => setImageUri(null)}>
          <Text style={styles.removeImage}>Supprimer l&apos;image</Text>
        </Pressable>
      )}

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
  imagePicker: {
    borderRadius: 8,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  imagePlaceholder: {
    height: 120,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    color: "#999",
    fontSize: 14,
  },
  removeImage: {
    color: "#e53935",
    fontSize: 13,
    textAlign: "center",
    marginTop: -4,
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
