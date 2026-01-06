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
    profileSection: {
      alignItems: "center",
      marginBottom: 30,
    },
    avatarWrapper: {
      position: "relative",
    },
    avatarContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    avatarImage: {
      width: "100%",
      height: "100%",
      borderRadius: 50,
    },
    editAvatarBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
    },
    form: {
      width: "100%",
      marginBottom: 20,
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
    input: {
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 15,
      paddingVertical: 12,
      fontSize: 15,
      height: 48,
    },
    dateInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 15,
      height: 48,
    },
    dateInput: {
      flex: 1,
      fontSize: 15,
      paddingVertical: 12,
    },
    radioContainer: {
      flexDirection: "row",
      gap: 20,
      marginTop: 8,
    },
    radioOption: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
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
    radioLabel: {
      fontSize: 15,
      fontWeight: "500",
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
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalOverlayContent: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContent: {
      borderRadius: 20,
      padding: 24,
      width: "100%",
      maxWidth: 400,
      borderWidth: 0,
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 15,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 20,
      textAlign: "center",
    },
    datePickerIOS: {
      height: 220,
      marginVertical: 10,
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
    modalDescription: {
      fontSize: 14,
      marginBottom: 20,
      textAlign: "center",
    },
    passwordInputGroup: {
      marginBottom: 20,
    },
    passwordInput: {
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 15,
      paddingVertical: 12,
      fontSize: 15,
      height: 48,
    },
    errorText: {
      fontSize: 12,
      marginTop: 5,
    },
    majorList: {
      maxHeight: 300,
      marginVertical: 10,
    },
    majorOption: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
    },
    majorOptionText: {
      fontSize: 15,
      flex: 1,
    },
  });
