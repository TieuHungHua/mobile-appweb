import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createStyles } from "./BookedRooms.styles";
import { mockBookedRooms } from "./BookedRooms.mock";

export default function BookedRoomsScreen({
  theme,
  lang,
  strings,
  colors,
  onNavigate,
}) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [rooms, setRooms] = useState(mockBookedRooms);

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "#2ecc71"; // Green
      case "pending":
        return "#f39c12"; // Orange
      case "completed":
        return "#95a5a6"; // Gray
      case "cancelled":
        return "#e74c3c"; // Red
      default:
        return colors.muted;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "approved":
        return "Đã duyệt";
      case "pending":
        return "Chờ duyệt";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getButtonConfig = (status) => {
    switch (status) {
      case "approved":
      case "pending":
        return {
          text: "Hủy đặt phòng",
          icon: "close",
          color: status === "approved" ? "#e74c3c" : "#f39c12",
        };
      case "completed":
        return {
          text: "Xem chi tiết",
          icon: "eye",
          color: colors.buttonBg,
        };
      case "cancelled":
        return {
          text: "Chi tiết",
          icon: "information-circle",
          color: colors.muted,
        };
      default:
        return { text: "Chi tiết", icon: "chevron-forward", color: colors.muted };
    }
  };

  const handleButtonPress = (room) => {
    const config = getButtonConfig(room.status);
    if (room.status === "approved" || room.status === "pending") {
      Alert.alert(
        "Xác nhận",
        `Bạn có chắc chắn muốn hủy đặt phòng ${room.name}?`,
        [
          { text: "Không", style: "cancel" },
          {
            text: "Có",
            style: "destructive",
            onPress: () => {
              setRooms(
                rooms.map((r) =>
                  r.id === room.id ? { ...r, status: "cancelled" } : r
                )
              );
              Alert.alert("Thành công", "Đã hủy đặt phòng thành công");
            },
          },
        ]
      );
    } else {
      // View details
      Alert.alert("Chi tiết", `Thông tin chi tiết về phòng ${room.name}`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: "#F6F7F8" }]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => onNavigate?.("settings")}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.headerText} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.headerText }]}>
          {strings.bookedRooms || "Phòng đã đặt"}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {rooms.map((room) => {
          const statusColor = getStatusColor(room.status);
          const buttonConfig = getButtonConfig(room.status);

          return (
            <View
              key={room.id}
              style={[
                styles.roomCard,
                {
                  backgroundColor: colors.cardBg,
                  borderLeftColor: statusColor,
                },
              ]}
            >
              {/* Status Badge */}
              <View style={styles.statusBadgeContainer}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: statusColor },
                  ]}
                />
                <Text
                  style={[styles.statusText, { color: statusColor }]}
                >
                  {getStatusText(room.status)}
                </Text>
              </View>

              {/* Room Info */}
              <View style={styles.roomContent}>
                <View style={styles.roomInfo}>
                  <Text style={[styles.roomName, { color: colors.text }]}>
                    {room.name}
                  </Text>

                  {/* Room Details */}
                  <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                      <Ionicons
                        name="people-outline"
                        size={16}
                        color={colors.muted}
                      />
                      <Text
                        style={[styles.detailText, { color: colors.muted }]}
                      >
                        Sức chứa: {room.capacity} người
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={16}
                        color={colors.muted}
                      />
                      <Text
                        style={[styles.detailText, { color: colors.muted }]}
                      >
                        Ngày: {room.date}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color={colors.muted}
                      />
                      <Text
                        style={[styles.detailText, { color: colors.muted }]}
                      >
                        Giờ: {room.time}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons
                        name="document-text-outline"
                        size={16}
                        color={colors.muted}
                      />
                      <Text
                        style={[styles.detailText, { color: colors.muted }]}
                        numberOfLines={2}
                      >
                        Mục đích: {room.purpose}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Room Image */}
                <View style={styles.imageContainer}>
                  {room.image ? (
                    <Image
                      source={room.image}
                      style={styles.roomImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.roomImagePlaceholder,
                        { backgroundColor: colors.inputBg },
                      ]}
                    >
                      <Ionicons
                        name="cube-outline"
                        size={40}
                        color={colors.muted}
                      />
                    </View>
                  )}
                </View>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: buttonConfig.color + "20" },
                ]}
                onPress={() => handleButtonPress(room)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={buttonConfig.icon}
                  size={18}
                  color={buttonConfig.color}
                />
                <Text
                  style={[styles.actionButtonText, { color: buttonConfig.color }]}
                >
                  {buttonConfig.text}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

