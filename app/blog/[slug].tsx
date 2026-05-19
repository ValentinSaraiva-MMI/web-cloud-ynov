import { Link, useLocalSearchParams } from "expo-router";
import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getCommentData } from "../../firebase/get_comment_data";
import "../../firebaseConfig";
import app from "../../firebaseConfig";

import { ThemedText } from "@/components/themed-text";

const db = getFirestore(app, "bddvalentin");

type Post = { id: string; title: string; text: string; createdBy: string };
type Comment = { id: string; text: string; createdBy: string };

export default function BlogPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const user = getAuth().currentUser;

  useEffect(() => {
    const fetchPost = async () => {
      const snap = await getDoc(doc(db, "posts", slug));
      if (snap.exists()) {
        setPost({ id: snap.id, ...snap.data() } as Post);
      }
    };
    const fetchComments = async () => {
      const data = await getCommentData(slug);
      setComments(data as Comment[]);
    };
    fetchPost();
    fetchComments();
  }, [slug]);

  if (!post) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title">{post.title}</ThemedText>
      <Text style={styles.author}>Par {post.createdBy}</Text>
      <Text style={styles.text}>{post.text}</Text>

      <View style={styles.divider} />

      <ThemedText type="subtitle" style={{ color: "#111" }}>
        Commentaires ({comments.length})
      </ThemedText>

      {comments.length === 0 && (
        <Text style={styles.empty}>Aucun commentaire pour l&apos;instant.</Text>
      )}

      {comments.map((c) => (
        <View key={c.id} style={styles.commentCard}>
          <Text style={styles.commentAuthor}>{c.createdBy}</Text>
          <Text>{c.text}</Text>
        </View>
      ))}

      {user ? (
        <Link href={`/newcomment?postId=${slug}`} asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Ajouter un commentaire</Text>
          </Pressable>
        </Link>
      ) : (
        <Text style={styles.warning}>Connectez-vous pour commenter.</Text>
      )}
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
  author: {
    color: "#888",
    fontSize: 13,
    fontStyle: "italic",
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 8,
  },
  empty: {
    color: "#999",
    fontStyle: "italic",
  },
  commentCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  commentAuthor: {
    fontWeight: "700",
    fontSize: 13,
    color: "#1565c0",
  },
  button: {
    backgroundColor: "#1565c0",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  warning: {
    color: "#e53935",
    fontSize: 13,
    textAlign: "center",
    fontStyle: "italic",
  },
});
