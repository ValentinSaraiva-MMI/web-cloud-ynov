import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { getPostData } from "../../firebase/get_post_data";

import { ThemedText } from "@/components/themed-text";

export default function HomeScreen() {
  type Post = { id: string; title: string; text: string; createdBy: string; date: Date; imageUrl?: string };
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getPostData();
      setPosts(data as Post[]);
    };
    fetchData();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title">Bienvenue</ThemedText>
      <Link href="/newpost" style={styles.link}>
        Créer un nouveau post
      </Link>
      {posts.map((p) => (
        <Link key={p.id} href={`/blog/${p.id}`} asChild>
          <Pressable style={styles.item}>
            {p.imageUrl && (
              <Image source={{ uri: p.imageUrl }} style={styles.itemImage} resizeMode="cover" />
            )}
            <Text style={styles.itemTitle}>{p.title}</Text>
            <Text style={styles.itemText} numberOfLines={2}>{p.text}</Text>
            <Text style={styles.author}>Par {p.createdBy}</Text>
          </Pressable>
        </Link>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
    gap: 16,
  },
  link: {
    color: "#1565c0",
    fontWeight: "600",
    fontSize: 15,
  },
  item: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    overflow: "hidden",
    gap: 4,
  },
  itemImage: {
    width: "100%",
    height: 160,
    borderRadius: 0,
  },
  itemTitle: {
    fontWeight: "700",
    fontSize: 16,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  itemText: {
    paddingHorizontal: 12,
  },
  author: {
    color: "#888",
    fontSize: 12,
    fontStyle: "italic",
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
});
