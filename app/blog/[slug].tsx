import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getCommentData } from "../../firebase/get_comment_data";
import { deletePost } from "../../firebase/delete_post";
import { getLikes } from "../../firebase/get_likes";
import { toggleLike } from "../../firebase/toggle_like";
import "../../firebaseConfig";
import app from "../../firebaseConfig";

import { ThemedText } from "@/components/themed-text";

const db = getFirestore(app, "bddvalentin");

type Post = { id: string; title: string; text: string; createdBy: string; createdByUid?: string; imageUrl?: string };
type Comment = { id: string; text: string; createdBy: string };

export default function BlogPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
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
    const fetchLikes = async () => {
      const data = await getLikes(slug, user?.uid ?? null);
      setLikesCount(data.count);
      setLiked(data.liked);
    };
    fetchPost();
    fetchComments();
    fetchLikes();
  }, [slug]);

  const handleDelete = async () => {
    if (Platform.OS === "web") {
      if (!window.confirm("Supprimer ce post ? Cette action est irréversible.")) return;
      await deletePost(slug);
      router.replace("/");
    } else {
      Alert.alert("Supprimer le post", "Cette action est irréversible.", [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            await deletePost(slug);
            router.replace("/");
          },
        },
      ]);
    }
  };

  const handleToggleLike = async () => {
    if (!user || likeLoading) return;
    setLikeLoading(true);
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((c) => (newLiked ? c + 1 : c - 1));
    try {
      await toggleLike(slug, user.uid, !newLiked);
    } catch {
      setLiked(!newLiked);
      setLikesCount((c) => (newLiked ? c - 1 : c + 1));
    } finally {
      setLikeLoading(false);
    }
  };

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

      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />
      )}

      <Text style={styles.text}>{post.text}</Text>

      <View style={styles.likeRow}>
        <Pressable
          style={[styles.likeButton, liked && styles.likeButtonActive]}
          onPress={handleToggleLike}
          disabled={!user || likeLoading}
        >
          <Text style={[styles.likeButtonText, liked && styles.likeButtonTextActive]}>
            {liked ? "❤️" : "🤍"} {likesCount} {likesCount === 1 ? "J'aime" : "J'aime"}
          </Text>
        </Pressable>
        {!user && (
          <Text style={styles.likeHint}>Connectez-vous pour liker.</Text>
        )}
      </View>

      {user && post.createdByUid === user.uid && (
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Supprimer ce post</Text>
        </Pressable>
      )}

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
  postImage: {
    width: "100%",
    height: 220,
    borderRadius: 10,
    marginVertical: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  likeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  likeButtonActive: {
    borderColor: "#e53935",
    backgroundColor: "#fdecea",
  },
  likeButtonText: {
    fontSize: 15,
    color: "#555",
    fontWeight: "600",
  },
  likeButtonTextActive: {
    color: "#e53935",
  },
  likeHint: {
    color: "#999",
    fontSize: 12,
    fontStyle: "italic",
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
  deleteButton: {
    borderWidth: 1.5,
    borderColor: "#e53935",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#e53935",
    fontWeight: "600",
    fontSize: 14,
  },
});
