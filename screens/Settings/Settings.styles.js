import { StyleSheet, Platform } from "react-native";

export const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingTop: Platform.OS === "ios" ? 50 : 30,
      paddingHorizontal: 16,
      paddingBottom: 20,
      minHeight: Platform.OS === "ios" ? 80 : 60,
    },
    headerContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
    },
    content: {
      padding: 16,
      paddingBottom: 100,
    },
    card: {
      borderRadius: 16,
      padding: 16,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    profileSection: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
      gap: 12,
    },
    avatarContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    userName: {
      flex: 1,
      fontSize: 18,
      fontWeight: "600",
    },
    logoutButton: {
      padding: 8,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "600",
      marginBottom: 12,
      marginTop: 4,
    },
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      paddingHorizontal: 4,
    },
    settingLabel: {
      fontSize: 15,
      fontWeight: "500",
    },
    divider: {
      height: 1,
      marginVertical: 8,
      marginHorizontal: -4,
    },
  });
