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
    searchButton: {
      padding: 4,
    },
    tabsContainer: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.inputBorder,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 12,
      position: "relative",
    },
    activeTab: {
      // Active tab styling
    },
    tabText: {
      fontSize: 15,
      fontWeight: "600",
    },
    tabIndicator: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 3,
      borderRadius: 2,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 16,
      marginVertical: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
    },
    content: {
      padding: 16,
      paddingBottom: 30,
      gap: 12,
    },
    bookItem: {
      flexDirection: "row",
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      gap: 12,
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    bookCover: {
      width: 80,
      height: 110,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    coverImage: {
      width: "100%",
      height: "100%",
      borderRadius: 8,
    },
    bookDetails: {
      flex: 1,
      gap: 6,
    },
    bookTitle: {
      fontSize: 16,
      fontWeight: "700",
    },
    bookAuthor: {
      fontSize: 13,
      fontWeight: "500",
    },
    expirationDate: {
      fontSize: 12,
      marginTop: 4,
    },
    statusBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1,
      marginTop: 4,
    },
    statusText: {
      fontSize: 11,
      fontWeight: "600",
    },
    renewButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: "center",
    },
    renewButtonText: {
      fontSize: 14,
      fontWeight: "600",
    },
    returnButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: "center",
    },
    returnButtonText: {
      fontSize: 14,
      fontWeight: "600",
    },
    expiredButton: {
      marginTop: 8,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: "center",
    },
    expiredButtonText: {
      fontSize: 14,
      fontWeight: "600",
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
      gap: 12,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: "500",
      textAlign: "center",
    },
    expiredBookItem: {
      opacity: 0.6,
    },
    divider: {
      height: 1,
      marginVertical: 16,
      marginHorizontal: 4,
    },
  });
