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
    keyboardView: {
      flex: 1,
    },
    content: {
      padding: 16,
      paddingBottom: 30,
    },
    card: {
      borderRadius: 16,
      padding: 20,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    description: {
      fontSize: 14,
      marginBottom: 24,
      lineHeight: 20,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 15,
      fontWeight: "500",
      marginBottom: 8,
    },
    required: {
      fontSize: 15,
    },
    passwordInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 15,
      height: 48,
    },
    passwordInput: {
      flex: 1,
      fontSize: 15,
      paddingVertical: 12,
    },
    errorText: {
      fontSize: 12,
      marginTop: 5,
    },
    saveButton: {
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: "600",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalOverlayContent: {
      flex: 1,
      justifyContent: "flex-start",
      alignItems: "center",
      padding: 20,
      paddingTop: Platform.OS === "ios" ? 150 : 120,
    },
    modalContent: {
      borderRadius: 16,
      padding: 20,
      width: "100%",
      maxWidth: 400,
      borderWidth: 1,
      shadowColor: "#000",
      shadowOpacity: 0.3,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 5 },
      elevation: 10,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 8,
      textAlign: "center",
    },
    modalDescription: {
      fontSize: 14,
      marginBottom: 20,
      textAlign: "center",
      lineHeight: 20,
    },
    verificationMethods: {
      gap: 12,
      marginBottom: 20,
    },
    methodOption: {
      borderWidth: 2,
      borderRadius: 12,
      padding: 16,
    },
    methodContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    methodInfo: {
      flex: 1,
    },
    methodTitle: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 4,
    },
    methodSubtitle: {
      fontSize: 13,
    },
    radioCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
    },
    radioSelected: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    otpSection: {
      marginBottom: 20,
    },
    otpLabel: {
      fontSize: 15,
      fontWeight: "500",
      marginBottom: 12,
    },
    otpInput: {
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 15,
      paddingVertical: 12,
      fontSize: 20,
      height: 56,
      textAlign: "center",
      letterSpacing: 8,
      fontWeight: "600",
    },
    countdownText: {
      fontSize: 13,
      textAlign: "center",
      marginTop: 12,
    },
    resendText: {
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
      marginTop: 12,
    },
    modalActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: "600",
    },
  });
