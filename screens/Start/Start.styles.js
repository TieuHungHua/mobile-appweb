import { StyleSheet, Dimensions } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#FFFFFF",
    },

    heroSection: {
      flex: 0.67,
      width: "100%",
      borderBottomLeftRadius: 100,
      borderBottomRightRadius: 100,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 60,
      paddingBottom: 40,
    },

    heroContent: {
      alignItems: "center",
      paddingHorizontal: 20,
      gap: 12,
    },

    heroTitle: {
      fontSize: 32,
      fontWeight: "800",
      letterSpacing: 0.5,
      textAlign: "center",
      marginBottom: 4,
    },

    heroSubtitle: {
      fontSize: 22,
      fontWeight: "800",
      fontStyle: "italic",
      textAlign: "center",
      marginBottom: 8,
    },

    descriptionContainer: {
      alignItems: "center",
      marginTop: 8,
      gap: 4,
    },

    heroDescription: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: "400",
      textAlign: "center",
    },

    bottomSection: {
      flex: 0.33, // Takes up 1/3 of the screen
      backgroundColor: "#FFFFFF",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },

    primaryButton: {
      paddingHorizontal: 50,
      paddingVertical: 16,
      borderRadius: 30,
      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,
      minWidth: 200,
    },

    primaryText: {
      fontWeight: "700",
      fontSize: 16,
      textAlign: "center",
    },
  });
