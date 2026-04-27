import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useLocalSearchParams } from "expo-router";

export default function BlogPage() {
  const { slug } = useLocalSearchParams();

  return (
    <ThemedView>
      <ThemedText>Blog post :{slug}</ThemedText>
    </ThemedView>
  );
}
