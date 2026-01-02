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
    forgotPasswordCard: {
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
    forgotPasswordTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 15,
      textAlign: "center",
    },
    forgotPasswordDescription: {
      fontSize: 14,
      marginBottom: 25,
      textAlign: "center",
      lineHeight: 20,
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
    forgotPasswordButton: {
      width: "100%",
      borderRadius: 10,
      paddingVertical: 15,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,
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
    switchText: {
      fontSize: 14,
      fontWeight: "500",
    },
  });
