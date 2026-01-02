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
    headerSpacer: {
      width: 32,
    },
    content: {
      padding: 20,
      paddingBottom: 30,
      alignItems: "center",
    },
    card: {
      width: "100%",
      maxWidth: 400,
      borderRadius: 20,
      padding: 32,
      paddingTop: 40,
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 15,
      shadowOffset: { width: 0, height: 5 },
      elevation: 5,
      gap: 24,
    },
    userIconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "transparent",
    },
    libraryName: {
      fontSize: 18,
      fontWeight: "700",
      letterSpacing: 1,
      textAlign: "center",
      marginTop: 8,
    },
    qrContainer: {
      width: 220,
      height: 220,
      borderRadius: 12,
      borderWidth: 2,
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
      padding: 12,
      backgroundColor: "#FFFFFF",
      overflow: "hidden",
    },
    qrCodeImage: {
      width: "100%",
      height: "100%",
    },
    userName: {
      fontSize: 22,
      fontWeight: "700",
      textAlign: "center",
      marginTop: 8,
    },
    studentIdBadge: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginTop: 8,
    },
    studentIdText: {
      fontSize: 13,
      fontWeight: "600",
    },
    instructionsContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 8,
    },
    instructionsText: {
      fontSize: 14,
      fontWeight: "600",
    },
  });

