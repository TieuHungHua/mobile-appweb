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
      paddingBottom: 100,
      gap: 24,
    },
    section: {
      gap: 12,
    },
    sectionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: "700",
    },
    linkText: {
      fontSize: 14,
      fontWeight: "600",
    },
    dateScrollContainer: {
      gap: 8,
      paddingVertical: 4,
    },
    dateCard: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      minWidth: 80,
      alignItems: "center",
    },
    dateText: {
      fontSize: 14,
      fontWeight: "600",
    },
    timeScrollContainer: {
      gap: 8,
      paddingVertical: 4,
    },
    timeCard: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      minWidth: 100,
      alignItems: "center",
    },
    timeText: {
      fontSize: 14,
      fontWeight: "600",
    },
    roomCard: {
      flexDirection: "row",
      padding: 16,
      borderRadius: 12,
      gap: 12,
      position: "relative",
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    checkmark: {
      position: "absolute",
      top: 12,
      right: 12,
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    roomIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    roomInfo: {
      flex: 1,
      gap: 8,
    },
    roomName: {
      fontSize: 16,
      fontWeight: "700",
    },
    roomDetails: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    roomDetailItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    roomDetailText: {
      fontSize: 13,
      fontWeight: "500",
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 12,
      fontWeight: "600",
    },
    amenitiesRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
    },
    amenityTag: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    amenityText: {
      fontSize: 12,
      fontWeight: "500",
    },
    inputGroup: {
      gap: 8,
    },
    inputLabel: {
      fontSize: 15,
      fontWeight: "600",
    },
    textInput: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      fontSize: 14,
      minHeight: 80,
      textAlignVertical: "top",
    },
    quantitySelector: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 12,
      padding: 4,
      gap: 8,
    },
    quantityButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    quantityButtonText: {
      fontSize: 20,
      fontWeight: "700",
    },
    quantityValue: {
      flex: 1,
      textAlign: "center",
      fontSize: 18,
      fontWeight: "700",
    },
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      paddingBottom: Platform.OS === "ios" ? 34 : 16,
      borderTopWidth: 1,
      borderTopColor: colors.inputBorder + "40",
    },
    confirmButton: {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    confirmButtonText: {
      fontSize: 16,
      fontWeight: "700",
    },
  });
