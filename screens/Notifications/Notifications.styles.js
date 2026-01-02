import { StyleSheet, Platform } from "react-native";

export const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingTop: Platform.OS === "ios" ? 44 : 20,
      paddingHorizontal: 16,
      paddingBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "700",
      flex: 1,
      textAlign: "center",
    },
    markAllRead: {
      fontSize: 14,
      fontWeight: "600",
    },
    tabBar: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.inputBorder + "40",
    },
    tab: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    tabText: {
      fontSize: 14,
    },
    content: {
      padding: 16,
      paddingBottom: 30,
      gap: 12,
    },
    notificationCard: {
      flexDirection: "row",
      padding: 16,
      borderRadius: 12,
      borderLeftWidth: 4,
      gap: 12,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    notificationContent: {
      flex: 1,
      gap: 4,
    },
    notificationHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    notificationTitle: {
      fontSize: 15,
      fontWeight: "700",
      flex: 1,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    notificationText: {
      fontSize: 13,
      fontWeight: "500",
      lineHeight: 18,
    },
    timestamp: {
      fontSize: 12,
      fontWeight: "500",
      minWidth: 60,
      textAlign: "right",
    },
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
      gap: 16,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: "600",
    },
  });

