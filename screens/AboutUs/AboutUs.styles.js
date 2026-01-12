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
    heroCard: {
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    heroTitle: {
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 8,
      textAlign: "center",
    },
    heroSubtitle: {
      fontSize: 14,
      textAlign: "center",
      fontStyle: "italic",
    },
    sectionCard: {
      borderRadius: 12,
      padding: 16,
      shadowColor: "#000",
      shadowOpacity: 0.03,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      gap: 12,
    },
    sectionIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: "700",
      flex: 1,
    },
    sectionContent: {
      fontSize: 14,
      lineHeight: 22,
    },
    contactCard: {
      borderRadius: 12,
      padding: 16,

      shadowColor: "#000",
      shadowOpacity: 0.03,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    contactHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 16,
    },
    contactTitle: {
      fontSize: 17,
      fontWeight: "700",
    },
    contactItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.inputBorder + "40",
    },
    contactIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    contactInfo: {
      flex: 1,
      gap: 4,
    },
    contactLabel: {
      fontSize: 12,
      fontWeight: "500",
    },
    contactValue: {
      fontSize: 14,
      lineHeight: 20,
    },
    footerCard: {
      borderRadius: 12,
      padding: 16,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 8,
    },
    footerText: {
      fontSize: 13,
      lineHeight: 20,
      textAlign: "center",
    },
  });
