import { StyleSheet, Platform } from "react-native";

export const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingTop: Platform.OS === "ios" ? 44 : 20,
      paddingHorizontal: 20,
      paddingBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: colors.inputBorder + "30",
    },
    backButton: {
      padding: 8,
      borderRadius: 8,
      marginLeft: -8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "800",
      flex: 1,
      textAlign: "center",
      letterSpacing: 0.3,
    },
    headerSpacer: {
      width: 32,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
      gap: 20,
    },
    introCard: {
      borderRadius: 16,
      padding: 28,
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,

      borderColor: colors.inputBorder + "20",
    },
    iconContainer: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
      backgroundColor: colors.buttonBg + "15",

      borderColor: colors.buttonBg + "30",
    },
    introTitle: {
      fontSize: 24,
      fontWeight: "800",
      marginBottom: 12,
      textAlign: "center",
      letterSpacing: 0.2,
    },
    introText: {
      fontSize: 13,
      marginBottom: 16,
      textAlign: "center",
      fontWeight: "600",
      letterSpacing: 0.3,
    },
    introDescription: {
      fontSize: 15,
      lineHeight: 24,
      textAlign: "center",
      fontWeight: "500",
    },
    sectionCard: {
      borderRadius: 14,
      padding: 20,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,

      borderColor: colors.inputBorder + "15",
      marginBottom: 2,
    },
    sectionDivider: {
      height: 1,
      backgroundColor: colors.inputBorder + "20",
      marginVertical: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "800",
      marginBottom: 16,
      letterSpacing: 0.3,
    },
    sectionContent: {
      fontSize: 14,
      lineHeight: 24,
      fontWeight: "500",
      letterSpacing: 0.2,
    },
    footerCard: {
      borderRadius: 14,
      padding: 20,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 16,
      marginTop: 12,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,

      borderColor: colors.inputBorder + "20",
      borderLeftWidth: 4,
      borderLeftColor: colors.buttonBg,
    },
    footerText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 22,
      fontWeight: "500",
      letterSpacing: 0.2,
    },
  });
