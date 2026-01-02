import { StyleSheet, Platform } from "react-native";

export const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingTop: 50,
      paddingBottom: 20,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "bold",
      letterSpacing: 0.5,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 30,
      justifyContent: "center",
    },
    cardContainer: {
      marginTop: -15,
    },
    registerCard: {
      borderRadius: 25,
      padding: 30,
      marginTop: 0,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    registerTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 25,
      textAlign: "center",
    },
    form: {
      width: "100%",
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 15,
      marginBottom: 10,
      fontWeight: "400",
    },
    required: {
      fontSize: 15,
    },
    input: {
      borderWidth: 1.5,
      borderRadius: 10,
      paddingHorizontal: 15,
      paddingVertical: 13,
      fontSize: 15,
      height: 48,
    },
    inputError: {
      borderColor: "#e74c3c",
    },
    errorText: {
      fontSize: 12,
      marginTop: 5,
    },
    errorContainer: {
      marginBottom: 15,
      padding: 10,
      borderRadius: 8,
      backgroundColor: "#e74c3c15",
    },
    radioContainer: {
      flexDirection: "row",
      marginTop: 10,
      gap: 20,
    },
    radioOption: {
      flexDirection: "row",
      alignItems: "center",
    },
    radioCircle: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },
    radioSelected: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    radioLabel: {
      fontSize: 15,
    },
    registerButton: {
      width: "100%",
      borderRadius: 10,
      paddingVertical: 15,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,
    },
    registerButtonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      fontSize: 15,
      fontWeight: "bold",
    },
    backButton: {
      width: "100%",
      backgroundColor: "transparent",
      borderRadius: 10,
      paddingVertical: 15,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 15,
      borderWidth: 1.5,
    },
    backButtonText: {
      fontSize: 15,
      fontWeight: "500",
    },
    footer: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderColor: colors.inputBorder,
      backgroundColor: colors.cardBg,
      gap: 12,
    },
    footerItem: {
      gap: 6,
    },
    footerLabel: {
      fontSize: 14,
      fontWeight: "600",
    },
    switchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
  });
