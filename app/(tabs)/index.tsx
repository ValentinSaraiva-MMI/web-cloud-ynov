import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { getPostData } from "../../firebase/get_post_data";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function HomeScreen() {
  type Post = { id: string; title: string; text: string; createdBy: string; date: Date };
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getPostData();
      console.log(data);
      setPosts(data as Post[]);
    };
    fetchData();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Bienvenue</ThemedText>
      <Link href="/newpost" style={styles.link}>
        Créer un nouveau post
      </Link>
      {posts.map((p) => (
        <View key={p.id} style={styles.item}>
          <Text style={styles.itemTitle}>{p.title}</Text>
          <Text>{p.text}</Text>
        </View>
      ))}
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
  link: {
    color: "#1565c0",
    fontWeight: "600",
    fontSize: 15,
  },
  item: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  itemTitle: {
    fontWeight: "700",
    fontSize: 16,
  },
});
