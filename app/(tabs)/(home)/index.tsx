
import React from "react";
import { FlatList, StyleSheet, View, Text } from "react-native";
import { useTheme } from "@react-navigation/native";
import { modalDemos } from "@/components/homeData";
import { DemoCard } from "@/components/DemoCard";

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={modalDemos}
        renderItem={({ item }) => <DemoCard item={item} />}
        keyExtractor={(item) => item.route}
        contentContainerStyle={styles.listContainer}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              🚀 Discover Amazing Modals!
            </Text>
            <Text style={[styles.subtitle, { color: theme.dark ? '#98989D' : '#666' }]}>
              Tap any card below to experience next-level interactions ✨
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
  },
});
