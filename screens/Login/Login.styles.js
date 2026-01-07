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
      paddingBottom: 200,
    },
    cardContainer: {
      marginTop: -15,
    },
    loginCard: {
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
    userIconContainer: {
      alignItems: "center",
      marginBottom: 30,
      marginTop: 10,
    },
    userIconCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    userIconHead: {
      width: 32,
      height: 32,
      borderRadius: 16,
      position: "absolute",
      top: 20,
    },
    userIconBody: {
      width: 45,
      height: 35,
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
      borderBottomLeftRadius: 22,
      borderBottomRightRadius: 22,
      position: "absolute",
      top: 48,
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
    passwordHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1.5,
      borderRadius: 10,
      paddingHorizontal: 12,
      height: 48,
    },
    inputIcon: {
      fontSize: 16,
      marginRight: 8,
    },
    inputField: {
      flex: 1,
      fontSize: 15,
      paddingVertical: Platform.OS === "ios" ? 10 : 6,
    },
    visibilityIcon: {
      fontSize: 18,
      paddingHorizontal: 4,
    },
    input: {
      borderWidth: 1.5,
      borderRadius: 10,
      paddingHorizontal: 15,
      paddingVertical: 13,
      fontSize: 15,
      height: 48,
    },
    forgotPassword: {
      fontSize: 13,
    },
    loginButtonContainer: {
      marginTop: 15,
    },
    loginButton: {
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
    switchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    switchText: {
      fontSize: 14,
      fontWeight: "500",
    },
    langButton: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
    },
    langList: {
      marginTop: 6,
      borderRadius: 8,
      borderWidth: 1,
      overflow: "hidden",
    },
    langItem: {
      paddingVertical: 10,
      paddingHorizontal: 12,
    },
    errorContainer: {
      marginBottom: 15,
      padding: 12,
      borderRadius: 8,
      backgroundColor: "rgba(255, 68, 68, 0.1)",
    },
    errorText: {
      fontSize: 14,
      textAlign: "center",
    },
  });
