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
      padding: 16,
      paddingBottom: 30,
      gap: 16,
    },
    introCard: {
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    introTitle: {
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 8,
      textAlign: "center",
    },
    introText: {
      fontSize: 12,
      marginBottom: 12,
      textAlign: "center",
    },
    introDescription: {
      fontSize: 14,
      lineHeight: 22,
      textAlign: "center",
    },
    sectionCard: {
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      shadowColor: "#000",
      shadowOpacity: 0.03,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 12,
    },
    sectionContent: {
      fontSize: 14,
      lineHeight: 22,
    },
    footerCard: {
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      marginTop: 8,
    },
    footerText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 20,
    },
  });
