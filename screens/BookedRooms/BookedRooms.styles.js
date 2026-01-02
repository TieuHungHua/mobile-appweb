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
    headerSpacer: {
      width: 32,
    },
    content: {
      padding: 16,
      paddingBottom: 30,
      gap: 16,
    },
    roomCard: {
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
      gap: 12,
    },
    statusBadgeContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 13,
      fontWeight: "600",
    },
    roomContent: {
      flexDirection: "row",
      gap: 12,
    },
    roomInfo: {
      flex: 1,
      gap: 12,
    },
    roomName: {
      fontSize: 16,
      fontWeight: "700",
    },
    detailsContainer: {
      gap: 8,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    detailText: {
      fontSize: 13,
      fontWeight: "500",
      flex: 1,
    },
    imageContainer: {
      width: 100,
      height: 100,
      borderRadius: 8,
      overflow: "hidden",
    },
    roomImage: {
      width: "100%",
      height: "100%",
    },
    roomImagePlaceholder: {
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderRadius: 8,
      gap: 8,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: "600",
    },
  });
