import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { signout } from "../../firebase/auth_signout";
import { updateUserPhotoUrl } from "../../firebase/auth_update_photo_url";
import { updateUserProfile } from "../../firebase/auth_update_profile";
import { uploadToFirebase } from "../../firebase/storage_upload_file";
import "../../firebaseConfig";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Toast, useToast } from "@/components/toast";

export default function ProfilScreen() {
  const router = useRouter();
  const { toast, show, hide } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (u) => {
      setUser(u);
      if (u) {
        setDisplayName(u.displayName ?? "");
        setPhotoURL(u.photoURL ?? "");
      }
    });
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

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];
      const fileName = uri.split("/").pop();
      const uploadResp = await uploadToFirebase(uri, fileName);
      let res = await updateUserPhotoUrl(uploadResp);
      if (res) {
        setPhotoURL(uploadResp);
      }
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await updateUserProfile(displayName, photoURL);
      setUser(getAuth().currentUser);
      setIsEditing(false);
      show("Profil mis à jour !", "success");
    } catch {
      show("Erreur lors de la mise à jour.", "error");
    }
  };

  if (!user) {
    return (
      <ThemedView style={styles.container}>
        <Toast {...toast} onHide={hide} />
        <ThemedText type="title">Profil</ThemedText>
        <Text style={styles.warning}>Vous n&apos;êtes pas connecté</Text>
        <Pressable
          style={styles.button}
          onPress={() => router.replace("/connexion")}
        >
          <Text style={styles.buttonText}>Se connecter</Text>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Toast {...toast} onHide={hide} />

      <ThemedText type="title">Profil</ThemedText>

      <Pressable onPress={pickImage}>
        {photoURL ? (
          <Image source={{ uri: photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitial}>
              {user.displayName?.[0]?.toUpperCase() ??
                user.email?.[0]?.toUpperCase() ??
                "?"}
            </Text>
          </View>
        )}
        <Text style={styles.avatarHint}>Modifier</Text>
      </Pressable>

      <View style={styles.infoCard}>
        <ThemedText type="subtitle" style={{ color: "#111" }}>
          Informations
        </ThemedText>

        <InfoRow label="Nom" value={user.displayName ?? "—"} />
        <InfoRow label="Email" value={user.email ?? "—"} />
        <InfoRow label="UID" value={user.uid} mono />
        <InfoRow
          label="Email vérifié"
          value={user.emailVerified ? "Oui" : "Non"}
        />
        <InfoRow label="Photo URL" value={user.photoURL ?? "—"} />

        <ThemedText style={styles.providerTitle}>Providers</ThemedText>
        {user.providerData.map((profile) => (
          <InfoRow
            key={profile.providerId}
            label="Provider"
            value={profile.providerId}
          />
        ))}
      </View>

      {isEditing ? (
        <View style={styles.infoCard}>
          <ThemedText type="subtitle">Modifier le profil</ThemedText>

          <Text style={styles.label}>Nom affiché</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Votre nom"
          />

          <View style={styles.row}>
            <Pressable
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => setIsEditing(false)}
            >
              <Text style={[styles.buttonText, { color: "#333" }]}>
                Annuler
              </Text>
            </Pressable>
            <Pressable style={styles.button} onPress={handleUpdateProfile}>
              <Text style={styles.buttonText}>Enregistrer</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable
          style={[styles.button, styles.buttonOutline]}
          onPress={() => setIsEditing(true)}
        >
          <Text style={[styles.buttonText]}>Modifier le profil</Text>
        </Pressable>
      )}

      <Pressable
        style={[styles.button, styles.buttonDanger]}
        onPress={handleSignout}
      >
        <Text style={styles.buttonText}>Se déconnecter</Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={[styles.infoValue, mono && styles.mono]}
        numberOfLines={1}
        ellipsizeMode="middle"
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 80,
    paddingBottom: 40,
    gap: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignSelf: "center",
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#1565c0",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "700",
  },
  avatarHint: {
    textAlign: "center",
    color: "#1565c0",
    fontSize: 12,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: "#f5f5f5",
    color: "#1565c0",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  infoLabel: {
    fontWeight: "600",
    color: "#555",
    flex: 1,
  },
  infoValue: {
    color: "#222",
    flex: 2,
    textAlign: "right",
  },
  mono: {
    fontFamily: "monospace",
    fontSize: 11,
    color: "#666",
  },
  providerTitle: {
    fontWeight: "600",
    marginTop: 8,
  },
  label: {
    fontWeight: "600",
    color: "#555",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  button: {
    backgroundColor: "#1565c0",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
  },
  buttonSecondary: {
    backgroundColor: "#e0e0e0",
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#1565c0",
  },
  buttonDanger: {
    backgroundColor: "#e53935",
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
