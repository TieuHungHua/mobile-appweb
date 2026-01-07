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
    roomCard: {
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
      gap: 12,
    },
    statusBadgeContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 13,
      fontWeight: "600",
    },
    roomContent: {
      flexDirection: "row",
      gap: 12,
    },
    roomInfo: {
      flex: 1,
      gap: 12,
    },
    roomName: {
      fontSize: 16,
      fontWeight: "700",
    },
    detailsContainer: {
      gap: 8,
    },
    detailRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    detailText: {
      fontSize: 13,
      fontWeight: "500",
      flex: 1,
    },
    imageContainer: {
      width: 100,
      height: 100,
      borderRadius: 8,
      overflow: "hidden",
    },
    roomImage: {
      width: "100%",
      height: "100%",
    },
    roomImagePlaceholder: {
      width: "100%",
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
      borderRadius: 8,
      gap: 8,
    },
    actionButtonText: {
      fontSize: 14,
      fontWeight: "600",
    },
    loadingContainer: {
      paddingVertical: 60,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
      fontWeight: "500",
    },
    emptyContainer: {
      paddingVertical: 60,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    emptyText: {
      fontSize: 14,
      fontWeight: "500",
      textAlign: "center",
      paddingHorizontal: 20,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContent: {
      width: "100%",
      maxWidth: 500,
      maxHeight: "90%",
      borderRadius: 20,
      padding: 24,
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 5 },
      elevation: 10,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      flex: 1,
    },
    modalCloseButton: {
      padding: 4,
    },
    modalLoadingContainer: {
      paddingVertical: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    modalScrollView: {
      maxHeight: 500,
    },
    modalSection: {
      marginBottom: 24,
      gap: 12,
    },
    modalSectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 8,
    },
    modalInfoRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      marginBottom: 12,
    },
    modalInfoText: {
      fontSize: 14,
      fontWeight: "500",
      flex: 1,
    },
    modalResourcesContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      flex: 1,
    },
    modalResourceTag: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    modalResourceText: {
      fontSize: 12,
      fontWeight: "500",
    },
    modalSubtext: {
      fontSize: 14,
      fontWeight: "400",
      marginBottom: 20,
      lineHeight: 20,
    },
    modalInputContainer: {
      marginBottom: 20,
      gap: 8,
    },
    modalInputLabel: {
      fontSize: 14,
      fontWeight: "600",
    },
    modalTextInput: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      fontSize: 14,
      minHeight: 100,
    },
    modalButtonContainer: {
      flexDirection: "row",
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    modalButtonCancel: {
      borderWidth: 1,
      backgroundColor: "transparent",
    },
    modalButtonConfirm: {
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: "700",
    },
  });
