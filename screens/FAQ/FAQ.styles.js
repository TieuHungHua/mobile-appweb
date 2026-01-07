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
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
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
    keyboardView: {
      flex: 1,
    },
    content: {
      padding: 16,
      paddingBottom: 30,
      gap: 24,
    },
    section: {
      gap: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      paddingHorizontal: 4,
    },
    faqList: {
      gap: 12,
    },
    faqItem: {
      borderRadius: 12,
      borderWidth: 1,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    faqHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      gap: 12,
    },
    faqHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    faqIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    faqQuestion: {
      fontSize: 14,
      fontWeight: "600",
      flex: 1,
    },
    faqAnswerContainer: {
      paddingHorizontal: 16,
      paddingBottom: 16,
      paddingLeft: 60, // Align with question text
    },
    faqAnswer: {
      fontSize: 13,
      fontWeight: "400",
      lineHeight: 20,
    },
    divider: {
      height: 24,
    },
    feedbackForm: {
      borderRadius: 12,
      borderWidth: 1,
      padding: 20,
      gap: 20,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    inputGroup: {
      gap: 8,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "600",
    },
    textInput: {
      height: 48,
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 16,
      fontSize: 14,
    },
    textArea: {
      minHeight: 120,
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 14,
    },
    submitButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      borderRadius: 12,
      gap: 8,
      marginTop: 8,
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 4,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: "700",
    },
    submitIcon: {
      marginLeft: 4,
    },
    helperText: {
      fontSize: 12,
      fontWeight: "400",
      textAlign: "center",
      lineHeight: 18,
      paddingHorizontal: 16,
      marginTop: 8,
    },
  });

